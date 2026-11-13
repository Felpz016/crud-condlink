// Endereço base das Cloud Functions da Condlink. Vem do arquivo .env.
// Tudo que começa com EXPO_PUBLIC_ é copiado para dentro do app:
// serve para endereço, NUNCA para senha ou chave secreta.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

// Uma rota por recurso. São functions que já existem: o app do morador
// da Condlink usa exatamente as mesmas.
export const ROTAS = {
  login: '/app-login/v1/login',
  unidade: '/app-pessoa-me/v1/pessoa/me',
  residentes: '/app-residente-manage/v1/residente/',
};
