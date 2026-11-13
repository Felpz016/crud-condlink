/// <reference types="node" />
// Testes de src/utils/validar.ts. Rode com: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validarMorador } from '../src/utils/validar.ts';

const valido = {
  nome: 'Teste Felipe 1',
  cpf: '900.111.222-33',
  email: 'teste@exemplo.com',
  telefone: '(16) 3333-4444',
};

test('morador completo e certo passa', () => {
  assert.equal(validarMorador(valido), '');
});

test('nome curto não passa', () => {
  assert.equal(validarMorador({ ...valido, nome: 'Jo' }), 'Informe o nome completo.');
});

test('CPF com 10 dígitos não passa (passo 36 do roteiro)', () => {
  assert.equal(validarMorador({ ...valido, cpf: '900.111.222-3' }), 'O CPF precisa ter 11 dígitos.');
});

test('e-mail sem domínio não passa, e e-mail vazio passa', () => {
  assert.equal(validarMorador({ ...valido, email: 'teste@' }), 'E-mail inválido.');
  assert.equal(validarMorador({ ...valido, email: '' }), '');
});

test('telefone sem DDD não passa no cadastro', () => {
  assert.equal(validarMorador({ ...valido, telefone: '3333-4444' }), 'Telefone com DDD: 10 ou 11 dígitos.');
});

test('na edição o telefone é travado e não é validado', () => {
  assert.equal(validarMorador({ ...valido, telefone: '3333-4444' }, true), '');
});
