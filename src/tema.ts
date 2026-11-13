// MUDANÇA em relação ao roteiro: no PDF cada arquivo repete os códigos de cor
// ('#14A5C4', '#0F1B33'...). Aqui as cores moram num lugar só. Para trocar o
// azul do app inteiro, muda-se uma linha. É a mesma ideia dos tokens de cor
// da Vitrine (src/constants/tema.ts), só que sem NativeWind.
export const CORES = {
  fundo: '#F1F5F9', // cinza bem claro, fundo das telas
  superficie: '#FFFFFF', // cartões e campos
  primaria: '#14A5C4', // azul Condlink: botão principal e carregando
  noite: '#0F1B33', // texto forte e cabeçalho
  destaque: '#61DAFB', // azul claro sobre o cabeçalho escuro
  texto: '#334155', // texto comum
  textoSuave: '#475569', // detalhes (CPF, telefone)
  textoApagado: '#64748B', // avisos e lista vazia
  placeholder: '#94A3B8',
  borda: '#CBD5E1',
  travado: '#E2E8F0', // campo que não aceita digitação e botão secundário
  perigo: '#DC2626', // erro e botão de inativar
  sombra: 'rgba(15, 27, 51, 0.6)', // fundo escurecido atrás de janelas
} as const;
