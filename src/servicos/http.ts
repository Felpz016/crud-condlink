import { API_URL } from '../config';

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Opcoes {
  metodo?: Metodo;
  token?: string;
  corpo?: object;
}

// MUDANÇA em relação ao roteiro: o erro de sessão vencida ganha um NOME
// próprio. Assim quem recebe o erro consegue diferenciá-lo dos outros e
// voltar sozinho para o login (desafio "Sessão vencida" do PDF).
const SESSAO_EXPIRADA = 'SessaoExpirada';

// MUDANÇA: quando a API não manda o campo "error", o app mostra uma frase
// que o morador entende, em vez de só "Erro 429".
const MENSAGENS_POR_STATUS: Record<number, string> = {
  400: 'Dados inválidos. Confira os campos.',
  404: 'Morador não encontrado nesta unidade.',
  409: 'Já existe um cadastro com esse CPF.',
  429: 'Tentativas demais. Espere um pouco e tente de novo.',
};

// Uma função só para falar com a API. Ela monta a URL, põe o token no
// cabeçalho Authorization, converte o corpo para JSON e trata o erro.
export async function requisicao<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL não definida: confira o arquivo .env');
  }

  const cabecalhos: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opcoes.token) {
    cabecalhos.Authorization = `Bearer ${opcoes.token}`;
  }

  let resposta: Response;
  try {
    resposta = await fetch(API_URL + caminho, {
      method: opcoes.metodo ?? 'GET',
      headers: cabecalhos,
      body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
    });
  } catch {
    // MUDANÇA: sem internet o fetch nem chega a ter resposta, ele LANÇA um
    // TypeError ("Network request failed"). Trocamos por uma frase clara.
    throw new Error('Sem conexão com a Condlink. Confira a internet do celular.');
  }

  const dados = await resposta.json().catch(() => ({}));

  // 401 COM token = o token venceu. Sem token (no login), 401 é senha errada,
  // e a mensagem certa é a que a própria API mandou.
  if (resposta.status === 401 && opcoes.token) {
    const erro = new Error('Sua sessão expirou. Entre de novo.');
    erro.name = SESSAO_EXPIRADA;
    throw erro;
  }
  if (!resposta.ok) {
    throw new Error(dados.error ?? mensagemPorStatus(resposta.status));
  }
  return dados as T;
}

function mensagemPorStatus(status: number): string {
  if (status >= 500) {
    return 'A Condlink está com problemas agora. Tente de novo em instantes.';
  }
  return MENSAGENS_POR_STATUS[status] ?? `Erro ${status} ao chamar a API.`;
}

// true quando o erro é o da sessão vencida (o 401 com token, acima).
export function sessaoExpirou(erro: unknown): boolean {
  return erro instanceof Error && erro.name === SESSAO_EXPIRADA;
}

// Transforma qualquer erro capturado num texto para mostrar na tela.
export function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro inesperado.';
}
