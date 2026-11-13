import { ROTAS } from '../config';
import { requisicao } from '../servicos/http';
import type { Sessao } from './login';

// O método é DELETE, mas a API NÃO apaga: muda o morador para ativo = 0.
// O cadastro continua no banco (exclusão lógica) e some da lista de ativos.
// Por isso a função se chama "inativar": o nome diz o que ACONTECE, e não o
// método HTTP que ela usa. É o DELETE do passo 23, sem corpo.
export async function inativarMorador(sessao: Sessao, idMorador: string): Promise<void> {
  await requisicao(`${ROTAS.residentes}${idMorador}`, {
    metodo: 'DELETE',
    token: sessao.token,
  });
}
