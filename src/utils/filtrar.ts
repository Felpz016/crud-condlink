import type { Morador } from '../api/listarMoradores';

// Desafio "Busca na lista" do roteiro: devolve só os moradores cujo NOME
// contém o termo digitado, SEM chamar a API de novo (a lista já está na
// memória do celular; filtrar aqui é instantâneo e não gasta internet).
//
// Regras (provadas em tests/filtrar.test.ts):
//   1. termo vazio (ou só espaços) devolve a lista inteira;
//   2. não diferencia maiúscula de minúscula ("ana" acha "Ana");
//   3. ignora acento ("joao" acha "João").
export function filtrarPorNome(moradores: Morador[], termo: string): Morador[] {
  const procurado = simplificar(termo);
  if (!procurado) {
    return moradores;
  }
  return moradores.filter((morador) => simplificar(morador.nome).includes(procurado));
}

// "  João " vira "joao": sem espaços nas pontas, minúsculo e sem acento.
// O normalize('NFD') separa a letra do acento ("ã" vira "a" + "~"), e o
// replace apaga os acentos soltos (a faixa ̀-ͯ do Unicode).
function simplificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
