import type { DadosMorador } from '../api/cadastrarMorador';
import { somenteDigitos } from './formatar';

// Formato básico de e-mail: algo@algo.algo, sem espaços.
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// MUDANÇA em relação ao roteiro: no PDF a função validar fica escondida
// dentro do FormularioMorador.tsx. Aqui ela mora sozinha, sem React, e por
// isso dá para testá-la (tests/validar.test.ts) sem abrir o app.
//
// Devolve o primeiro problema encontrado, ou texto vazio se está tudo certo.
export function validarMorador(dados: DadosMorador, telefoneTravado = false): string {
  if (dados.nome.trim().length < 3) {
    return 'Informe o nome completo.';
  }
  if (somenteDigitos(dados.cpf).length !== 11) {
    return 'O CPF precisa ter 11 dígitos.';
  }
  // MUDANÇA: o PDF só confere se tem "@". "a@" passaria; aqui não passa.
  // E-mail continua opcional: vazio é aceito.
  const email = dados.email.trim();
  if (email && !FORMATO_EMAIL.test(email)) {
    return 'E-mail inválido.';
  }
  const digitos = somenteDigitos(dados.telefone).length;
  if (!telefoneTravado && digitos > 0 && (digitos < 10 || digitos > 11)) {
    return 'Telefone com DDD: 10 ou 11 dígitos.';
  }
  return '';
}
