/// <reference types="node" />
// MUDANÇA 5 de 5 (testes automáticos): o roteiro não tem testes. Rode com npm test.
// Testes de src/servicos/jwt.ts com o test runner do próprio Node (node:test).
// Rode com: npm test
//
// O primeiro teste é o da MUDANÇA 1: um nome com acento ('João') tem que sair
// igual de dentro do token. Com o JSON.parse(atob(...)) do PDF, sairia 'JoÃ£o'.
// Os outros conferem o tokenExpirado, que o App usa ao abrir.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { lerClaims, tokenExpirado } from '../src/servicos/jwt.ts';

// Monta um JWT de mentira: cabeçalho e conteúdo em Base64URL e uma
// assinatura qualquer. O app só LÊ o conteúdo; quem confere a assinatura é o servidor.
// Buffer.toString('base64url') é do Node; ele faz o mesmo que o servidor da
// Condlink faz ao gerar o token (inclusive o UTF-8 do acento).
function tokenFalso(claims: object): string {
  const base64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(claims)}.assinatura`;
}

// "Agora" em segundos, a mesma unidade do exp do token.
const agora = Math.floor(Date.now() / 1000);

// MUDANÇA 1: este é o teste que pegaria o bug do roteiro.
test('lê as claims do meio do token, inclusive com acento', () => {
  const token = tokenFalso({ condominios: ['1103'], nome: 'João', exp: agora + 60 });
  const claims = lerClaims(token);
  assert.deepEqual(claims.condominios, ['1103']);
  assert.equal(claims.nome, 'João');
});

test('token que vence daqui a 1 hora ainda vale', () => {
  assert.equal(tokenExpirado(tokenFalso({ exp: agora + 3600 })), false);
});

test('token que venceu há 1 segundo está expirado', () => {
  assert.equal(tokenExpirado(tokenFalso({ exp: agora - 1 })), true);
});

test('token sem exp conta como expirado', () => {
  assert.equal(tokenExpirado(tokenFalso({ nome: 'sem validade' })), true);
});

test('texto que não é JWT conta como expirado (não quebra o app)', () => {
  assert.equal(tokenExpirado('isto-nao-e-um-token'), true);
});
