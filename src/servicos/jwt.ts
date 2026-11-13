// O que vem dentro do JWT emitido pelo app-login.
export interface ClaimsJwt {
  condominios?: string[];
  condomino?: string;
  nome?: string;
  exp?: number;
  iat?: number;
}

// Um JWT tem três partes separadas por ponto: cabeçalho.conteúdo.assinatura.
// O conteúdo (a parte do meio) é só JSON em Base64URL: qualquer um LÊ.
// Alterar não adianta: a assinatura deixa de bater e o servidor recusa.
export function lerClaims(token: string): ClaimsJwt {
  const meio = token.split('.')[1] ?? '';
  const base64 = meio.replace(/-/g, '+').replace(/_/g, '/');
  const completo = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return JSON.parse(textoUtf8(atob(completo)));
}

// MUDANÇA (correção de um bug do roteiro): o atob devolve BYTES, um caractere
// por byte. Letra com acento ocupa 2 bytes em UTF-8, então "João" saía "JoÃ£o".
// Aqui cada byte vira %XX e o decodeURIComponent junta os bytes de volta em
// letras. (Funciona em qualquer celular; o TextDecoder nem sempre existe.)
function textoUtf8(bytes: string): string {
  const porcentos = Array.from(bytes, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'));
  return decodeURIComponent(porcentos.join(''));
}

// exp está em segundos desde 1970; Date.now() devolve milissegundos.
export function tokenExpirado(token: string): boolean {
  try {
    const { exp } = lerClaims(token);
    return !exp || Date.now() / 1000 >= exp;
  } catch {
    return true;
  }
}
