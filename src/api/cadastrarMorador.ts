import { ROTAS } from '../config';
import { requisicao } from '../servicos/http';
import { separarTelefone, somenteDigitos } from '../utils/formatar';
import type { Sessao } from './login';

// Os campos do formulário, do jeito que o usuário digita.
export interface DadosMorador {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
}

export const MORADOR_VAZIO: DadosMorador = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
};

interface RespostaCadastro {
  data: { id: string; nome: string; username: string };
  message: string;
}

// O morador novo entra na mesma unidade de quem está logado: a API tira a
// unidade do TOKEN, e não de um campo que o app manda (senão bastaria trocar
// o número para cadastrar gente na unidade do vizinho).
export async function cadastrarMorador(sessao: Sessao, dados: DadosMorador): Promise<string> {
  const cpf = somenteDigitos(dados.cpf);
  const telefone = separarTelefone(dados.telefone);
  const senha = senhaProvisoria();

  const resposta = await requisicao<RespostaCadastro>(ROTAS.residentes, {
    metodo: 'POST',
    token: sessao.token,
    corpo: {
      nome: dados.nome.trim(),
      cpf,
      email: dados.email.trim(),
      telefone: telefone.numero,
      // A API quer o DDD como NÚMERO, não texto. undefined some do JSON.
      ddd_telefone: telefone.ddd ? Number(telefone.ddd) : undefined,
      // A API exige login e senha: o login é o CPF, e a senha provisória
      // tem de ser trocada pelo morador no primeiro acesso ao app.
      username: cpf,
      password: senha,
    },
  });
  return resposta.data.id;
}

function senhaProvisoria(): string {
  return `Cl${Math.random().toString(36).slice(2, 10)}9`;
}
