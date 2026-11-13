/// <reference types="node" />
// Testes da camada que fala com a API, SEM internet: trocamos o fetch do
// JavaScript por um "fetch de mentira" que responde o que o teste mandar.
// Assim dá para provar o que o app faz com 401, 409, falta de rede e um
// detalhe que falha, sem gastar o usuário de teste da turma. Rode com: npm test
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

// O config.ts lê o endereço quando é importado, então ele vem antes do import.
process.env.EXPO_PUBLIC_API_URL = 'https://api.teste';
const { requisicao, sessaoExpirou, mensagemDe } = await import('../src/servicos/http.ts');
const { listarMoradores } = await import('../src/api/listarMoradores.ts');

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

test('401 COM token é sessão expirada', async () => {
  globalThis.fetch = (async () => resposta(401, { error: 'Token inválido' })) as typeof fetch;
  await assert.rejects(requisicao('/x', { token: 'velho' }), (e) => sessaoExpirou(e));
});

test('401 SEM token (login) mostra a mensagem da API, não "sessão expirada"', async () => {
  globalThis.fetch = (async () => resposta(401, { error: 'Usuário ou senha inválidos' })) as typeof fetch;
  await assert.rejects(requisicao('/login', { metodo: 'POST' }), (e) => {
    assert.equal(sessaoExpirou(e), false);
    assert.equal(mensagemDe(e), 'Usuário ou senha inválidos');
    return true;
  });
});

test('409 sem campo error vira uma frase que o morador entende', async () => {
  globalThis.fetch = (async () => resposta(409, {})) as typeof fetch;
  await assert.rejects(requisicao('/x', { token: 't' }), /Já existe um cadastro com esse CPF/);
});

test('sem internet o fetch lança, e o app mostra "Sem conexão"', async () => {
  globalThis.fetch = (async () => {
    throw new TypeError('Network request failed');
  }) as typeof fetch;
  await assert.rejects(requisicao('/x', { token: 't' }), /Sem conexão/);
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
