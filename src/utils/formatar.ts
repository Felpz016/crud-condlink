// =============================================================================
// formatar.ts: funções pequenas que arrumam CPF e telefone para mostrar.
//
// Onde entra nas 5 mudanças: MUDANÇA 4 de 5 (máscara enquanto digita).
// As quatro primeiras funções são do PDF. As duas últimas (mascararCpf e
// mascararTelefone) são novas e respondem ao desafio "Máscara enquanto
// digita" do roteiro.
// Resumo para a apresentação: "A máscara é só para os olhos. Na tela o
// usuário vê 111.222.333-44, mas o que vai para a API é 11122233344, porque
// o cadastro passa tudo pelo somenteDigitos antes de enviar."
// =============================================================================

// Tira tudo que não é dígito: "(16) 3333-4444" vira "1633334444".
// \D na expressão regular quer dizer "qualquer coisa que NÃO seja dígito".
// É ela que garante que a API recebe só números, com ou sem máscara.
export function somenteDigitos(texto?: string): string {
  return (texto ?? '').replace(/\D/g, '');
}

// "11122233344" vira "111.222.333-44". Se não tiver 11 dígitos, devolve como veio.
export function formatarCpf(cpf?: string): string {
  const d = somenteDigitos(cpf);
  if (d.length !== 11) {
    return cpf ?? '';
  }
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// "33334444" vira "3333-4444"; com DDD, "(16) 3333-4444".
export function formatarTelefone(ddd?: string, numero?: string): string {
  const n = somenteDigitos(numero);
  if (!n) {
    return '';
  }
  const corte = n.length - 4;
  const meio = `${n.slice(0, corte)}-${n.slice(corte)}`;
  return ddd ? `(${somenteDigitos(ddd)}) ${meio}` : meio;
}

// O caminho inverso: "(16) 3333-4444" vira { ddd: "16", numero: "33334444" }.
export function separarTelefone(texto: string): { ddd: string; numero: string } {
  const d = somenteDigitos(texto);
  if (d.length < 10) {
    return { ddd: '', numero: d };
  }
  return { ddd: d.slice(0, 2), numero: d.slice(2) };
}

// MUDANÇA 4 de 5 (desafio "Máscara enquanto digita" do PDF): o formatarCpf só formata
// quando já há 11 dígitos. Para formatar ENQUANTO o usuário digita, a máscara
// vai pondo ponto e traço conforme os dígitos chegam: "1112" vira "111.2".
// Também corta no 11º dígito, então ninguém consegue digitar CPF comprido.
//
// O truque: a cada tecla, a função recebe o texto INTEIRO do campo (com os
// pontos antigos), joga a pontuação fora com somenteDigitos e monta de novo.
// Por isso o backspace funciona: "111." vira "111" sem travar.
export function mascararCpf(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11); // no máximo 11 dígitos
  // Cada if é um "degrau": quanto mais dígitos, mais pontuação aparece.
  if (d.length <= 3) return d; //                   111
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`; //   111.222
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`; // 111.222.333
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`; // 111.222.333-44
}

// MUDANÇA 4: a mesma ideia para o telefone com DDD. "16333" vira "(16) 333";
// com 10 dígitos, "(16) 3333-4444"; com 11 (celular), "(16) 99999-8888".
export function mascararTelefone(texto: string): string {
  const d = somenteDigitos(texto).slice(0, 11); // DDD (2) + até 9 dígitos
  if (d.length <= 2) return d; // só o DDD ainda: "16"
  const ddd = d.slice(0, 2);
  const numero = d.slice(2);
  if (numero.length <= 4) return `(${ddd}) ${numero}`; // "(16) 3333"
  // Os últimos quatro dígitos ficam depois do traço, tenha o número 8 ou 9 dígitos.
  // Enquanto o número ainda está incompleto (até 8), o traço fica depois do 4º
  // dígito; com 9 (celular), o traço anda uma casa: 99999-8888.
  const corte = numero.length <= 8 ? 4 : numero.length - 4;
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`;
}
