# Laboratório bônus: crud-condlink

Roteiro: `crud-condlink.pdf` (aula bônus, 65 páginas, 43 passos em 6 fases). Este documento diz o que foi feito em cada fase, como as peças se encaixam e **o que mudou em relação ao código do PDF**.

## Fases e commits

| Fase | Passos | Commit | O que entrou |
| --- | --- | --- | --- |
| 1 | 5 a 16 | `fase 1: login do morador com JWT e sessao no SecureStore` | `.gitignore`/`.env`, `config.ts`, `http.ts`, `jwt.ts`, `armazenamento.ts`, `api/login.ts`, `Botao`, `Campo`, `TelaLogin`, `App` |
| curl | 17 a 23 | `curl: corpos JSON para testar o CRUD pelo terminal` | `curl/*.json` e `curl/README.md` |
| 2 | 24 a 27 | `fase 2: unidade do morador fixa no topo da tela` | `api/unidade.ts`, `CabecalhoUnidade`, `App` busca a unidade |
| 3 | 28 a 32 | `fase 3: listagem de moradores da unidade` | `utils/formatar.ts`, `api/listarMoradores.ts`, `TelaMoradores` (com o cartão no `renderItem`) |
| 4 | 33 a 36 | `fase 4: cadastrar novo morador na unidade` | `api/cadastrarMorador.ts`, `FormularioMorador` (com a validação) |
| 5 | 37 a 39 | `fase 5: editar morador pela listagem` | `api/editarMorador.ts`, botão Editar, estado `editando` |
| 6 | 40 a 43 | `fase 6: inativar morador com confirmacao` | `api/inativarMorador.ts`, `ConfirmarInativacao`, botão Inativar no cartão, estado `inativando` |
| — | — | `sdk 58: atualiza o projeto para o mesmo SDK do Expo Go` | `package.json` no SDK 58 (RN 0.88, React 19.3) |
| — | — | `reduz para 5 mudancas em relacao ao roteiro` | Volta ao código do PDF tudo que não é uma das 5 mudanças abaixo |

## Como funciona: o caminho de uma listagem

```
TelaMoradores          useEffect chama carregar()
   │
listarMoradores()      GET da lista + detalhes de cada um ao mesmo tempo (Promise.allSettled)
   │
requisicao()           fetch + cabeçalho Authorization: Bearer <token>
   │  HTTPS
Cloud Function         app-residente-manage tira a unidade do TOKEN
   │  SQL
MySQL                  tabela condomino, ativo = 1
   │  JSON volta
setMoradores(lista)    o React redesenha a FlatList (um cartão por morador)
```

A tela não sabe que existe HTTP, e a `requisicao` não sabe que existe tela: cada camada conversa só com a vizinha.

### Quem decide qual tela aparece (`App.tsx`)

1. `verificando` (o app acabou de abrir e está lendo o cofre): círculo girando.
2. Sem `sessao`: `TelaLogin`.
3. Com sessão, sem `unidade`: girando (ou o erro com o botão Sair).
4. Com as duas: `CabecalhoUnidade` + `TelaMoradores`.

### Onde mora cada segredo

| Coisa | Onde fica | Vai para o GitHub? |
| --- | --- | --- |
| `JWT_SECRET` (assina o token) | Só no servidor | Nunca |
| Endereço da API | `.env` (`EXPO_PUBLIC_API_URL`) | Não; o `.env.example` vai |
| Token do usuário | SecureStore (Keychain/Keystore) | Nunca |
| Senha do usuário | Em lugar nenhum depois do login | Nunca |
| `curl/login.json` | Só no PC | Não (`.gitignore`) |

## As 5 mudanças em relação ao código do PDF

O resto do código é o do roteiro, com os mesmos nomes de funções e arquivos, para dar para acompanhar pelo PDF. As 5 mudanças estão marcadas no código com o comentário `MUDANÇA N de 5`. Para achar: **Ctrl + Shift + F** › `MUDANÇA`.

| # | Mudança | Onde | Por quê |
| --- | --- | --- | --- |
| 1 | **Correção de bug**: nome com acento no token saía "JoÃ£o" | `servicos/jwt.ts` (`textoUtf8`) | O `atob` devolve bytes; letra com acento ocupa 2 bytes em UTF-8. O PDF faz `JSON.parse(atob(...))` direto. O teste `tests/jwt.test.ts` pegou o erro. |
| 2 | `Promise.allSettled` em vez de `Promise.all` | `api/listarMoradores.ts` | Com `Promise.all`, um único detalhe que falha derruba a lista inteira. Agora quem falhou aparece sem telefone ("Telefone: -") e os outros aparecem normais. |
| 3 | Sessão vencida volta sozinha ao login, com aviso | `servicos/http.ts` (`sessaoExpirou`), `App.tsx` (`sessaoVenceu`), `TelaLogin` (prop `aviso`), `TelaMoradores` (`chamarApi`, prop `aoSessaoExpirar`) | Desafio do PDF. No roteiro o morador via "Sessão expirada" e tinha de achar o Sair sozinho. |
| 4 | Máscara de CPF e telefone enquanto digita | `utils/formatar.ts` (`mascararCpf`, `mascararTelefone`), `FormularioMorador` | Desafio do PDF. O morador vê `123.456.789-01` enquanto digita, e não dá para passar de 11 dígitos. |
| 5 | Testes automáticos e CI | `tests/`, `.github/workflows/ci.yml` | O PDF não tem testes. São 22 testes rodando sem internet (a API é simulada com um `fetch` falso), e o GitHub roda todos a cada push. |

O SDK 58 não conta como mudança de código: só acompanha a versão do Expo Go do celular. O `curl/`, o simulador no navegador e esta documentação também ficam de fora da conta.

### O que ficou igual ao PDF de propósito

- A validação do formulário fica dentro do `FormularioMorador`, como no roteiro, e o e-mail só precisa ter `@`.
- O cartão do morador continua dentro do `renderItem` da `TelaMoradores`, e as cores continuam escritas direto em cada arquivo (`'#14A5C4'`).
- Não há busca por nome, contador de moradores nem botão Mostrar senha.
- **Não** validei os dígitos verificadores do CPF (outro desafio do PDF). O roteiro manda usar CPF **inventado**; com a validação, só passariam CPFs com dígitos certos, e um número com dígitos certos pode ser de uma pessoa de verdade.

## Testes

`npm test` roda os arquivos de `tests/` com o `node:test` (sem instalar nada):

| Arquivo | Testes | O que prova |
| --- | --- | --- |
| `jwt.test.ts` | 5 | Lê as claims (com acento), token vencido, sem `exp` e texto que não é token |
| `unidade.test.ts` | 3 | "Bloco A - Apto 102", só apartamento, e "Unidade 404" |
| `formatar.test.ts` | 7 | CPF e telefone formatados, separados e com máscara (inclusive apagando) |
| `api.test.ts` | 7 | Token no cabeçalho, 401 com e sem token, o telefone de cada morador, o `allSettled`, e o DELETE do inativar (e o 404) |

O `tests/resolver-ts.mjs` ensina o Node a achar `'../config'` como `'../config.ts'` (o Metro já faz isso no app). Por isso os arquivos de `src/api` usam `import type { Sessao }`: tipo puro precisa do `type` para o Node apagar o import.

O GitHub Actions roda `npm run check` e `npm test` a cada push e pull request.
