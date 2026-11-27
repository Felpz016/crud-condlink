// =============================================================================
// listarMoradores.ts: busca os moradores da unidade (o "R" do CRUD, GET).
//
// Onde entra nas 5 mudanças: MUDANÇA 2 de 5 (a lista não quebra se o
// telefone de UM morador falhar). Troca de Promise.all por Promise.allSettled.
// Resumo para a apresentação: "Com Promise.all, um detalhe que falha derruba
// a lista inteira. Com allSettled, só aquele morador fica sem telefone."
// =============================================================================
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
  // Pedido 1: a lista (até 100 moradores numa página só).
  const caminho = `${ROTAS.residentes}?page=1&page_size=100`;
  const resposta = await requisicao<RespostaLista>(caminho, { token: sessao.token });

  // A lista não traz o telefone; o detalhe de cada morador traz.
  // Os pedidos de detalhe saem TODOS AO MESMO TEMPO.
  //
  // MUDANÇA 2 de 5: o PDF usa Promise.all, que falha INTEIRO se
  // um único detalhe falhar (a tela mostraria só o erro, sem lista nenhuma).
  // O Promise.allSettled espera todos e diz, para cada um, se deu certo
  // ("fulfilled") ou não ("rejected"). Quem falhou aparece com os dados da
  // lista, só sem o telefone. Uma linha ruim não derruba as outras.
  //
  // Comparação rápida:
  //   Promise.all        -> [morador, morador, ...] ou ERRO (tudo ou nada)
  //   Promise.allSettled -> [{ status: 'fulfilled', value: morador },
  //                          { status: 'rejected',  reason: erro }, ...]
  //
  // Observação: um 401 (token vencido) continua quebrando a função, porque
  // acontece já no pedido 1, ANTES daqui. Isso é de propósito: aí o app
  // precisa voltar ao login (MUDANÇA 3), e não mostrar lista pela metade.
  const detalhes = await Promise.allSettled(
    resposta.data.map((morador) => buscarMorador(sessao, morador.id)),
  );
  // O resultado sai na MESMA ORDEM da lista, então o índice i de detalhes
  // corresponde ao morador resposta.data[i]. Deu certo: usa o detalhe
  // (com telefone). Falhou: usa o morador da lista (sem telefone).
  return detalhes.map((resultado, i) =>
    resultado.status === 'fulfilled' ? resultado.value : resposta.data[i],
  );
}

// Detalhe de UM morador: é o único pedido que devolve o telefone.
export async function buscarMorador(sessao: Sessao, id: string): Promise<Morador> {
  const resposta = await requisicao<RespostaDetalhe>(`${ROTAS.residentes}${id}`, {
    token: sessao.token,
  });
  return resposta.data;
}
