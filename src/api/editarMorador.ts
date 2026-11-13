import { ROTAS } from '../config';
import { requisicao } from '../servicos/http';
import { somenteDigitos } from '../utils/formatar';
import type { DadosMorador } from './cadastrarMorador';
import type { Sessao } from './login';

// PUT = atualização parcial: a API só mexe nos campos enviados.
// Telefone fica de fora: a edição desta API não aceita telefone
// (ela responde 200 e ignora; veja a experiência do passo 22).
export async function editarMorador(
  sessao: Sessao,
  idMorador: string,
  dados: DadosMorador,
): Promise<void> {
  await requisicao(`${ROTAS.residentes}${idMorador}`, {
    metodo: 'PUT',
    token: sessao.token,
    corpo: {
      nome: dados.nome.trim(),
      cpf: somenteDigitos(dados.cpf),
      email: dados.email.trim(),
    },
  });
}
