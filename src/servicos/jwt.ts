// =============================================================================
// jwt.ts: lê o que vem DENTRO do token que a API devolve no login.
//
// Onde entra nas 5 mudanças: MUDANÇA 1 de 5 (nome com acento saía errado).
// Resumo para a apresentação: "O roteiro decodificava o token com atob, que
// devolve bytes soltos. Letra com acento virava lixo ('JoÃ£o'). Eu junto os
// bytes de volta em texto UTF-8 antes do JSON.parse."
// =============================================================================

// O que vem dentro do JWT emitido pelo app-login.
// O ? em cada campo diz ao TypeScript que ele pode não vir.
export interface ClaimsJwt {
  condominios?: string[]; // ids dos condomínios da pessoa (o app usa o primeiro)
  condomino?: string;
  nome?: string; // aqui aparecia o bug do acento
  exp?: number; // quando o token vence, em SEGUNDOS desde 1970
  iat?: number; // quando o token foi emitido
}

// Um JWT tem três partes separadas por ponto: cabeçalho.conteúdo.assinatura.
// O conteúdo (a parte do meio) é só JSON em Base64URL: qualquer um LÊ.
// Alterar não adianta: a assinatura deixa de bater e o servidor recusa.
export function lerClaims(token: string): ClaimsJwt {
  // Passo 1: pega a parte do meio. Se o texto nem tiver ponto, fica ''.
  const meio = token.split('.')[1] ?? '';
  // Passo 2: Base64URL troca + por - e / por _ (para caber numa URL).
  // O atob só entende o Base64 normal, então desfazemos a troca.
  const base64 = meio.replace(/-/g, '+').replace(/_/g, '/');
  // Passo 3: Base64 tem tamanho múltiplo de 4. O Base64URL tira os '=' do
  // fim; aqui completamos com '=' até chegar no múltiplo de 4 de novo.
  const completo = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  // Passo 4: atob decodifica, textoUtf8 junta os bytes em letras, e o
  // JSON.parse transforma o texto em objeto.
  return JSON.parse(textoUtf8(atob(completo))); // MUDANÇA 1: o PDF faz JSON.parse(atob(completo))
}

// MUDANÇA 1 de 5 (correção de um bug do roteiro): o atob devolve BYTES, um caractere
// por byte. Letra com acento ocupa 2 bytes em UTF-8, então "João" saía "JoÃ£o".
// Aqui cada byte vira %XX e o decodeURIComponent junta os bytes de volta em
// letras. (Funciona em qualquer celular; o TextDecoder nem sempre existe.)
//
// Exemplo passo a passo com "ã", que em UTF-8 são os bytes C3 e A3:
//   atob devolve dois caracteres: "Ã" (código C3) e "£" (código A3)
//   viram "%c3%a3"
//   decodeURIComponent("%c3%a3") entende os dois bytes juntos e devolve "ã"
function textoUtf8(bytes: string): string {
  // Array.from percorre o texto caractere por caractere. charCodeAt(0) dá o
  // número do byte; toString(16) escreve em hexadecimal; padStart garante
  // dois dígitos (o byte 9 vira "09", e não "9").
  const porcentos = Array.from(bytes, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'));
  return decodeURIComponent(porcentos.join(''));
}

// exp está em segundos desde 1970; Date.now() devolve milissegundos.
// Por isso dividimos por 1000 antes de comparar.
// O App usa esta função ao abrir: token vencido nem chega a ser usado.
export function tokenExpirado(token: string): boolean {
  try {
    const { exp } = lerClaims(token);
    // Sem exp, não dá para saber até quando vale: tratamos como vencido.
    return !exp || Date.now() / 1000 >= exp;
  } catch {
    // Texto que não é JWT (lerClaims quebra): também conta como vencido,
    // e o app pede login de novo em vez de travar.
    return true;
  }
}
