/// <reference types="node" />
// MUDANÇA 5 de 5 (testes automáticos): o roteiro não tem testes. Rode com npm test.
// Testes da camada que fala com a API, SEM internet: trocamos o fetch do
// JavaScript por um "fetch de mentira" que responde o que o teste mandar.
// Assim dá para provar o que o app faz com 401, 404 e um detalhe que falha,
// sem gastar o usuário de teste da turma. Rode com: npm test
//
// O que estes testes provam, ligado a cada mudança:
//   - MUDANÇA 3: '401 COM token é sessão expirada' e '401 SEM token (login)...'
//   - MUDANÇA 2: 'se UM detalhe falhar, os outros aparecem'
//   - o resto confere o comportamento do PDF (token no cabeçalho, DELETE, 404).
//
// Formato de todo teste: test('o que deveria acontecer', () => { ... }).
// Dentro, o assert compara o que aconteceu com o que era esperado; se não
// bater, o teste falha e o npm test mostra qual foi.
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

// O config.ts lê o endereço quando é importado, então ele vem antes do import.
process.env.EXPO_PUBLIC_API_URL = 'https://api.teste';
const { requisicao, sessaoExpirou, mensagemDe } = await import('../src/servicos/http.ts');
const { listarMoradores } = await import('../src/api/listarMoradores.ts');
const { inativarMorador } = await import('../src/api/inativarMorador.ts');

// Guarda o fetch de verdade e o devolve depois de CADA teste (afterEach),
// para o fetch de mentira de um teste não vazar para o próximo.
const fetchOriginal = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = fetchOriginal;
});

// Monta uma resposta HTTP de mentira com status e corpo JSON.
function resposta(status: number, corpo: object): Response {
  return new Response(JSON.stringify(corpo), { status });
}

const sessao = { token: 'tok', nome: 'Teste', idCondominio: '1' };

test('manda o token no cabeçalho Authorization: Bearer', async () => {
  let cabecalhos: Record<string, string> = {};
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    cabecalhos = init.headers as Record<string, string>;
    return resposta(200, { ok: true });
  }) as typeof fetch;

  await requisicao('/qualquer', { token: 'abc' });
  assert.equal(cabecalhos.Authorization, 'Bearer abc');
});

// MUDANÇA 3: com token, o 401 vira o erro com nome 'SessaoExpirada'.
// assert.rejects espera que a promessa FALHE e confere o erro com sessaoExpirou.
test('401 COM token é sessão expirada', async () => {
  globalThis.fetch = (async () => resposta(401, { error: 'Token inválido' })) as typeof fetch;
  await assert.rejects(requisicao('/x', { token: 'velho' }), (e) => sessaoExpirou(e));
});

// MUDANÇA 3, o outro lado: sem token (tela de login), 401 é senha errada.
// O app NÃO pode tratar isso como sessão vencida; tem que mostrar o texto da API.
test('401 SEM token (login) mostra a mensagem da API, não "sessão expirada"', async () => {
  globalThis.fetch = (async () => resposta(401, { error: 'Usuário ou senha inválidos' })) as typeof fetch;
  await assert.rejects(requisicao('/login', { metodo: 'POST' }), (e) => {
    assert.equal(sessaoExpirou(e), false);
    assert.equal(mensagemDe(e), 'Usuário ou senha inválidos');
    return true;
  });
});

test('listarMoradores junta o telefone do detalhe de cada morador', async () => {
  globalThis.fetch = (async (url: string) => {
    if (url.includes('?page=1')) {
      return resposta(200, { data: [{ id: '1', nome: 'Ana' }, { id: '2', nome: 'Bia' }], meta: { total: 2 } });
    }
    const id = url.split('/').pop();
    return resposta(200, { data: { id, nome: id === '1' ? 'Ana' : 'Bia', telefone: `3333000${id}` } });
  }) as typeof fetch;

  const lista = await listarMoradores(sessao);
  assert.deepEqual(
    lista.map((m) => m.telefone),
    ['33330001', '33330002'],
  );
});

// MUDANÇA 2: o morador 2 responde 500 (erro do servidor). Com o Promise.all
// do PDF, a função inteira falharia. Com allSettled, os dois aparecem e só a
// Bia fica sem telefone.
test('se UM detalhe falhar, os outros aparecem (Promise.allSettled)', async () => {
  globalThis.fetch = (async (url: string) => {
    if (url.includes('?page=1')) {
      return resposta(200, { data: [{ id: '1', nome: 'Ana' }, { id: '2', nome: 'Bia' }], meta: { total: 2 } });
    }
    if (url.endsWith('/2')) {
      return resposta(500, {});
    }
    return resposta(200, { data: { id: '1', nome: 'Ana', telefone: '33330001' } });
  }) as typeof fetch;

  const lista = await listarMoradores(sessao);
  assert.equal(lista.length, 2);
  assert.equal(lista[0].telefone, '33330001');
  assert.equal(lista[1].nome, 'Bia'); // veio da lista, só sem telefone
  assert.equal(lista[1].telefone, undefined);
});

test('inativarMorador manda DELETE para .../residente/<id>, com token e sem corpo', async () => {
  let pedido: { url: string; init: RequestInit } | null = null;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    pedido = { url, init };
    return resposta(200, { message: 'Residente inativado' });
  }) as typeof fetch;

  await inativarMorador(sessao, '42');
  assert.ok(pedido);
  const { url, init } = pedido as { url: string; init: RequestInit };
  assert.equal(url, 'https://api.teste/app-residente-manage/v1/residente/42');
  assert.equal(init.method, 'DELETE');
  assert.equal(init.body, undefined);
  assert.equal((init.headers as Record<string, string>).Authorization, 'Bearer tok');
});

test('inativar um id que não é da unidade (404) mostra a mensagem da API', async () => {
  globalThis.fetch = (async () => resposta(404, { error: 'Residente não encontrado' })) as typeof fetch;
  await assert.rejects(inativarMorador(sessao, '1'), /Residente não encontrado/);
});
