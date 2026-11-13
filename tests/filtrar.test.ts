/// <reference types="node" />
// Testes da busca por nome (src/utils/filtrar.ts). Rode com: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Morador } from '../src/api/listarMoradores.ts';
import { filtrarPorNome } from '../src/utils/filtrar.ts';

const moradores: Morador[] = [
  { id: '1', nome: 'Ana Souza' },
  { id: '2', nome: 'João Teste' },
  { id: '3', nome: 'Mariana Lima' },
];

// Só os ids, para o assert ficar curto.
const ids = (lista: Morador[]) => lista.map((m) => m.id);

test('termo vazio devolve a lista inteira', () => {
  assert.equal(filtrarPorNome(moradores, '').length, 3);
  assert.equal(filtrarPorNome(moradores, '   ').length, 3);
});

test('"ana" acha Ana Souza e Mariana Lima (sem diferenciar maiúscula)', () => {
  assert.deepEqual(ids(filtrarPorNome(moradores, 'ana')), ['1', '3']);
  assert.deepEqual(ids(filtrarPorNome(moradores, 'ANA')), ['1', '3']);
});

test('"joao" acha João Teste (ignora acento), e "joão" também', () => {
  assert.deepEqual(ids(filtrarPorNome(moradores, 'joao')), ['2']);
  assert.deepEqual(ids(filtrarPorNome(moradores, 'joão')), ['2']);
});

test('"zzz" não acha ninguém', () => {
  assert.deepEqual(filtrarPorNome(moradores, 'zzz'), []);
});
