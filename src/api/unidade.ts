import { ROTAS } from '../config';
import { requisicao } from '../servicos/http';
// import type: só o TIPO, que some ao virar JavaScript (o Node dos testes exige).
import type { Sessao } from './login';

export interface Unidade {
  condominio: string;
  bloco: string;
  apartamento: string;
  numero: string;
}

// O app-pessoa-me devolve muita coisa; descrevemos só o que usamos.
interface RespostaPessoaMe {
  condomino: { bloco?: string; apartamento?: string; numero?: string };
  condominio: { nome: string };
}

// O morador não escolhe a unidade: ela vem do cadastro de quem fez login.
export async function buscarUnidade(sessao: Sessao): Promise<Unidade> {
  const resposta = await requisicao<RespostaPessoaMe>(ROTAS.unidade, {
    token: sessao.token,
  });
  const { condomino, condominio } = resposta;
  return {
    condominio: condominio.nome,
    bloco: condomino.bloco ?? '',
    apartamento: condomino.apartamento ?? '',
    numero: condomino.numero ?? '',
  };
}

// "Bloco A - Apto 102"; sem bloco nem apartamento, "Unidade 404".
export function nomeDaUnidade(unidade: Unidade): string {
  const bloco = unidade.bloco ? `Bloco ${unidade.bloco}` : '';
  const apto = unidade.apartamento ? `Apto ${unidade.apartamento}` : '';
  const texto = [bloco, apto].filter(Boolean).join(' - ');
  return texto || `Unidade ${unidade.numero}`;
}
