/// <reference types="node" />
// MUDANÇA 5 de 5 (testes automáticos): o roteiro não tem testes. Rode com npm test.
// Testes de src/utils/formatar.ts. Rode com: npm test
//
// Os quatro primeiros testes conferem as funções do PDF. Os três últimos
// são da MUDANÇA 4 (máscara enquanto digita): eles simulam o usuário
// digitando um dígito por vez, colando um CPF comprido e apagando.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  formatarCpf,
  formatarTelefone,
  mascararCpf,
  mascararTelefone,
  separarTelefone,
  somenteDigitos,
} from '../src/utils/formatar.ts';

test('somenteDigitos tira parênteses, espaço e traço', () => {
  assert.equal(somenteDigitos('(16) 3333-4444'), '1633334444');
  assert.equal(somenteDigitos(undefined), '');
});

test('formatarCpf põe pontos e traço só com 11 dígitos', () => {
  assert.equal(formatarCpf('11122233344'), '111.222.333-44');
  assert.equal(formatarCpf('123'), '123');
});

test('formatarTelefone com e sem DDD, fixo e celular', () => {
  assert.equal(formatarTelefone(undefined, '33334444'), '3333-4444');
  assert.equal(formatarTelefone('16', '33334444'), '(16) 3333-4444');
  assert.equal(formatarTelefone('16', '999998888'), '(16) 99999-8888');
  assert.equal(formatarTelefone('16', ''), '');
});

test('separarTelefone é o caminho inverso', () => {
  assert.deepEqual(separarTelefone('(16) 3333-4444'), { ddd: '16', numero: '33334444' });
  assert.deepEqual(separarTelefone('33334444'), { ddd: '', numero: '33334444' });
});

// MUDANÇA 4: cada linha é o campo depois de mais algumas teclas.
// A última cola 15 dígitos: a máscara corta no 11º.
test('mascararCpf vai formatando enquanto digita e para no 11º dígito', () => {
  assert.equal(mascararCpf('111'), '111');
  assert.equal(mascararCpf('1112'), '111.2');
  assert.equal(mascararCpf('1112223'), '111.222.3');
  assert.equal(mascararCpf('11122233344'), '111.222.333-44');
  assert.equal(mascararCpf('111222333449999'), '111.222.333-44');
});

// MUDANÇA 4: o mesmo para o telefone, fixo (10 dígitos) e celular (11).
test('mascararTelefone vai formatando enquanto digita', () => {
  assert.equal(mascararTelefone('16'), '16');
  assert.equal(mascararTelefone('163'), '(16) 3');
  assert.equal(mascararTelefone('1633334'), '(16) 3333-4');
  assert.equal(mascararTelefone('1633334444'), '(16) 3333-4444');
  assert.equal(mascararTelefone('16999998888'), '(16) 99999-8888');
});

// MUDANÇA 4: o caso que mais quebra máscara feita à mão. Se a máscara
// recolocasse o ponto logo depois de apagar, o usuário nunca sairia do lugar.
test('apagar com backspace não trava a máscara', () => {
  // "(16) 3" menos o "3" vira "(16) ", que a máscara transforma em "16".
  assert.equal(mascararTelefone('(16) '), '16');
  assert.equal(mascararCpf('111.'), '111');
});
