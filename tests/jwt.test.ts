/// <reference types="node" />
// Testes de src/servicos/jwt.ts com o test runner do próprio Node (node:test).
// Rode com: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { lerClaims, tokenExpirado } from '../src/servicos/jwt.ts';

// Monta um JWT de mentira: cabeçalho e conteúdo em Base64URL e uma
// assinatura qualquer. O app só LÊ o conteúdo; quem confere a assinatura é o servidor.
function tokenFalso(claims: object): string {
  const base64url = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url(claims)}.assinatura`;
}

const agora = Math.floor(Date.now() / 1000);

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
