import { ROTAS } from '../config';
import { requisicao } from '../servicos/http';
import type { Sessao } from './login';

// Os campos podem vir vazios ou nulos do banco: por isso o ? e o | null.
export interface Morador {
  id: string;
  nome: string;
  email?: string | null;
  cpf?: string | null;
  telefone?: string | null;
}

interface RespostaLista {
  data: Morador[];
  meta: { total: number };
}

interface RespostaDetalhe {
  data: Morador;
}

// A API devolve os moradores da unidade de quem fez login, menos ele mesmo.
export async function listarMoradores(sessao: Sessao): Promise<Morador[]> {
  const caminho = `${ROTAS.residentes}?page=1&page_size=100`;
  const resposta = await requisicao<RespostaLista>(caminho, { token: sessao.token });

  // A lista não traz o telefone; o detalhe de cada morador traz.
  // Os pedidos de detalhe saem TODOS AO MESMO TEMPO.
  //
  // MUDANÇA em relação ao roteiro: o PDF usa Promise.all, que falha INTEIRO se
  // um único detalhe falhar (a tela mostraria só o erro, sem lista nenhuma).
  // O Promise.allSettled espera todos e diz, para cada um, se deu certo
  // ("fulfilled") ou não ("rejected"). Quem falhou aparece com os dados da
  // lista, só sem o telefone. Uma linha ruim não derruba as outras.
  const detalhes = await Promise.allSettled(
    resposta.data.map((morador) => buscarMorador(sessao, morador.id)),
  );
  return detalhes.map((resultado, i) =>
    resultado.status === 'fulfilled' ? resultado.value : resposta.data[i],
  );
}

export async function buscarMorador(sessao: Sessao, id: string): Promise<Morador> {
  const resposta = await requisicao<RespostaDetalhe>(`${ROTAS.residentes}${id}`, {
    token: sessao.token,
  });
  return resposta.data;
}
