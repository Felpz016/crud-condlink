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
const SESSAO_EXPIRADA = 'SessaoExpirada';

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

  const resposta = await fetch(API_URL + caminho, {
    method: opcoes.metodo ?? 'GET',
    headers: cabecalhos,
    body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));

  // 401 COM token = o token venceu. Sem token (no login), 401 é senha errada,
  // e a mensagem certa é a que a própria API mandou.
  if (resposta.status === 401 && opcoes.token) {
    const erro = new Error('Sessão expirada. Saia e entre de novo.');
    erro.name = SESSAO_EXPIRADA; // MUDANÇA 3: o nome que identifica este erro
    throw erro;
  }
  if (!resposta.ok) {
    throw new Error(dados.error ?? `Erro ${resposta.status} ao chamar a API.`);
  }
  return dados as T;
}

// Transforma qualquer erro capturado num texto para mostrar na tela.
export function mensagemDe(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Erro inesperado.';
}

// MUDANÇA 3: true quando o erro é o da sessão vencida (o 401 com token).
export function sessaoExpirou(erro: unknown): boolean {
  return erro instanceof Error && erro.name === SESSAO_EXPIRADA;
}
