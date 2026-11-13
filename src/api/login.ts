import { ROTAS } from '../config';
import { requisicao } from '../servicos/http';
import { lerClaims } from '../servicos/jwt';

// O que o app guarda depois do login.
export interface Sessao {
  token: string;
  nome: string;
  idCondominio: string;
}

// O que o app-login devolve (só os campos que usamos).
interface RespostaLogin {
  token: string;
  nome: string;
}

export async function entrar(usuario: string, senha: string): Promise<Sessao> {
  const resposta = await requisicao<RespostaLogin>(ROTAS.login, {
    metodo: 'POST',
    // connected: true pediria um token de 30 dias; false, de 24 horas.
    corpo: { username: usuario, password: senha, connected: false },
  });

  // O condomínio vem de dentro do token, na claim "condominios".
  const idCondominio = lerClaims(resposta.token).condominios?.[0];
  if (!idCondominio) {
    throw new Error('Este usuário não tem condomínio liberado.');
  }
  return { token: resposta.token, nome: resposta.nome, idCondominio };
}
