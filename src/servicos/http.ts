// =============================================================================
// http.ts: o ÚNICO lugar do app que faz fetch. Todas as funções de src/api
// passam pela requisicao abaixo.
//
// Onde entra nas 5 mudanças: MUDANÇA 3 de 5 (sessão vencida volta ao login).
// O PDF já tratava o 401 com uma mensagem ("Sessão expirada..."), mas a tela
// só mostrava o texto e o usuário ficava preso, tendo que tocar em Sair.
// Aqui o erro ganha um NOME próprio, e a função sessaoExpirou permite que o
// App reconheça esse erro e volte sozinho para o login.
// Resumo para a apresentação: "Um erro comum vira um erro com nome. Quem
// recebe o erro pergunta 'é sessão vencida?' e decide o que fazer."
// =============================================================================
import { API_URL } from '../config';

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Opcoes {
  metodo?: Metodo;
  token?: string;
  corpo?: object;
}

// MUDANÇA 3 de 5 (sessão vencida volta ao login): o erro do 401 com token
// ganha um NOME próprio, para o App conseguir reconhecê-lo e voltar sozinho
// à tela de login. Veja a função sessaoExpirou, no fim do arquivo.
// Fica numa constante para o mesmo texto ser usado ao criar e ao conferir
// o erro: um erro de digitação num dos dois lugares quebraria a comparação.
const SESSAO_EXPIRADA = 'SessaoExpirada';

// Uma função só para falar com a API. Ela monta a URL, põe o token no
// cabeçalho Authorization, converte o corpo para JSON e trata o erro.
// O <T> é o tipo da resposta: quem chama diz o formato que espera receber.
export async function requisicao<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL não definida: confira o arquivo .env');
  }

  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opcoes.token) {
    cabecalhos.Authorization = `Bearer ${opcoes.token}`;
  }

  const resposta = await fetch(API_URL + caminho, {
    method: opcoes.metodo ?? 'GET',
    headers: cabecalhos,
    body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
  });

  // Se a resposta vier sem JSON (corpo vazio), usamos {} para não quebrar.
  const dados = await resposta.json().catch(() => ({}));

  // 401 COM token = o token venceu. Sem token (no login), 401 é senha errada,
  // e a mensagem certa é a que a própria API mandou.
  if (resposta.status === 401 && opcoes.token) {
    const erro = new Error('Sessão expirada. Saia e entre de novo.');
    // O PDF lançava só o Error com a mensagem. Comparar pela mensagem seria
    // frágil (bastaria mudar o texto). O name é a "etiqueta" do erro.
    erro.name = SESSAO_EXPIRADA; // MUDANÇA 3: o nome que identifica este erro
    throw erro;
  }
  if (!resposta.ok) {
    // Outros erros (409 CPF repetido, 404 não encontrado...): mostra o texto da API.
    throw new Error(dados.error ?? `Erro ${resposta.status} ao chamar a API.`);
  }
  return dados as T;
}

// Transforma qualquer erro capturado num texto para mostrar na tela.
export function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro inesperado.';
}

// MUDANÇA 3: true quando o erro é o da sessão vencida (o 401 com token).
// Quem usa: App.tsx (ao buscar a unidade) e TelaMoradores.tsx (ao listar,
// cadastrar, editar e inativar). Testado em tests/api.test.ts.
export function sessaoExpirou(erro: unknown): boolean {
  return erro instanceof Error && erro.name === SESSAO_EXPIRADA;
}
