/// <reference types="node" />
// Testes do nomeDaUnidade (src/api/unidade.ts). Rode com: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { nomeDaUnidade } from '../src/api/unidade.ts';

const base = { condominio: 'Residencial Teste', bloco: '', apartamento: '', numero: '' };

test('com bloco e apartamento: "Bloco A - Apto 102"', () => {
  assert.equal(nomeDaUnidade({ ...base, bloco: 'A', apartamento: '102' }), 'Bloco A - Apto 102');
});

test('só apartamento: "Apto 7"', () => {
  assert.equal(nomeDaUnidade({ ...base, apartamento: '7' }), 'Apto 7');
});

test('sem bloco nem apartamento, usa o número: "Unidade 404"', () => {
  assert.equal(nomeDaUnidade({ ...base, numero: '404' }), 'Unidade 404');
});
