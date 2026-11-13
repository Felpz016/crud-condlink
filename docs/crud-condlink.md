# Laboratório bônus: crud-condlink

Roteiro: `crud-condlink.pdf` (aula bônus, 65 páginas, 43 passos em 6 fases). Este documento diz o que foi feito em cada fase, como as peças se encaixam e **o que mudou em relação ao código do PDF**.

## Fases e commits

| Fase | Passos | Commit | O que entrou |
| --- | --- | --- | --- |
| 1 | 5 a 16 | `fase 1: login do morador com JWT e sessao no SecureStore` | `.gitignore`/`.env`, `config.ts`, `http.ts`, `jwt.ts`, `armazenamento.ts`, `api/login.ts`, `Botao`, `Campo`, `TelaLogin`, `App` |
| curl | 17 a 23 | `curl: corpos JSON para testar o CRUD pelo terminal` | `curl/*.json` e `curl/README.md` |
| 2 | 24 a 27 | `fase 2: unidade do morador fixa no topo da tela` | `api/unidade.ts`, `CabecalhoUnidade`, `App` busca a unidade |
| 3 | 28 a 32 | `fase 3: listagem de moradores da unidade` | `utils/formatar.ts`, `api/listarMoradores.ts`, `CartaoMorador`, `TelaMoradores` |
| 4 | 33 a 36 | `fase 4: cadastrar novo morador na unidade` | `api/cadastrarMorador.ts`, `utils/validar.ts`, `FormularioMorador` |
| 5 | 37 a 39 | `fase 5: editar morador pela listagem` | `api/editarMorador.ts`, botão Editar, estado `editando` |
| 6 | 40 a 43 | `fase 6: inativar morador com confirmacao` | `api/inativarMorador.ts`, `ConfirmarInativacao`, botão Inativar no `CartaoMorador`, estado `inativando` |
| desafio | — | `desafio: busca por nome na lista de moradores` | `utils/filtrar.ts`, campo Buscar por nome, contador "1 de 3 na busca" |

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
setMoradores(lista)    o React redesenha a FlatList (um CartaoMorador por morador)
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

## O que mudou em relação ao código do PDF

Todas as mudanças estão marcadas no código com o comentário `MUDANÇA`. Para achar: **Ctrl + Shift + F** › `MUDANÇA`.

| # | Mudança | Onde | Por quê |
| --- | --- | --- | --- |
| 1 | **Correção de bug**: nome com acento no token saía "JoÃ£o" | `servicos/jwt.ts` (`textoUtf8`) | O `atob` devolve bytes; letra com acento ocupa 2 bytes em UTF-8. O teste `tests/jwt.test.ts` pegou o erro. |
| 2 | `Promise.allSettled` em vez de `Promise.all` | `api/listarMoradores.ts` | Com `Promise.all`, um único detalhe que falha derruba a lista inteira. Agora quem falhou aparece sem telefone e os outros aparecem normais. |
| 3 | Sessão vencida volta sozinha ao login, com aviso | `servicos/http.ts` (`sessaoExpirou`), `App.tsx` (`sessaoVenceu`), `TelaMoradores` (`chamarApi`) | Desafio do PDF. Antes o usuário via "Sessão expirada" e tinha de achar o Sair. |
| 4 | Mensagens claras por status (409, 429, 500...) e sem internet | `servicos/http.ts` | "Erro 429" não diz nada ao morador; "Tentativas demais" diz. Sem rede, o `fetch` lança um `TypeError` que agora vira "Sem conexão". |
| 5 | Máscara de CPF e telefone enquanto digita | `utils/formatar.ts` (`mascararCpf`, `mascararTelefone`), `FormularioMorador` | Desafio do PDF. Também impede digitar mais de 11 dígitos. |
| 6 | Validação fora do componente, e e-mail com formato de verdade | `utils/validar.ts` | Função pura dá para testar sem abrir o app. O PDF aceitava `a@` como e-mail. |
| 7 | Cartão do morador virou componente | `componentes/CartaoMorador.tsx` | No PDF o `renderItem` crescia a cada fase. Agora a tela cuida dos dados e o cartão de desenhar. Mostra também o e-mail. |
| 8 | Cores num lugar só | `src/tema.ts` | O PDF repete `'#14A5C4'` em vários arquivos. Mesma ideia dos tokens da Vitrine. |
| 9 | Senha com Mostrar/Ocultar e Enter entra | `componentes/Campo.tsx` (prop `senha`), `TelaLogin` | Igual ao desafio da Aula 07 da Vitrine. |
| 10 | Contador "3 moradores ativos" | `TelaMoradores` | Mostra o total sem contar os cartões. |
| 11 | Sessão estragada no cofre não trava o app | `App.tsx` (`try/catch/finally` no `restaurar`) | Se o `JSON.parse` falhasse, o app ficava girando para sempre. |
| 12 | Acessibilidade nos botões | `Botao`, `Campo`, `CabecalhoUnidade` | `accessibilityRole="button"` para o leitor de tela; `hitSlop` no Sair. |
| 13 | Testes automáticos, CI e simulador | `tests/`, `.github/workflows/ci.yml`, `public/simulador.html` | 34 testes rodando sem internet (a API é simulada com um `fetch` falso). |
| 14 | Fase 6 adaptada à estrutura nova | `CartaoMorador` (prop `aoInativar`), `ConfirmarInativacao` com cores do tema, `confirmarInativacao` pelo `chamarApi` | O código do PDF põe o botão dentro do `renderItem`; aqui ele mora no cartão. Se o token vencer na hora de inativar, volta ao login. |
| 15 | Busca por nome | `utils/filtrar.ts`, `TelaMoradores` | Desafio do PDF. Filtra na memória (não chama a API), ignora maiúscula e acento, e o contador vira "1 de 3 na busca". |

### O que **não** mudou de propósito

- **Não** validei os dígitos verificadores do CPF (outro desafio do PDF). O roteiro manda usar CPF **inventado**; com a validação, só passariam CPFs com dígitos certos, e um número com dígitos certos pode ser de uma pessoa de verdade.
- Os nomes das funções e arquivos do PDF continuam iguais, para dar para acompanhar pelo roteiro.

## Testes

`npm test` roda os arquivos de `tests/` com o `node:test` (sem instalar nada):

| Arquivo | O que prova |
| --- | --- |
| `jwt.test.ts` | Lê as claims (com acento), token vencido, sem `exp` e texto que não é token |
| `unidade.test.ts` | "Bloco A - Apto 102", só apartamento, e "Unidade 404" |
| `formatar.test.ts` | CPF e telefone formatados, separados e com máscara (inclusive apagando) |
| `validar.test.ts` | Os erros do formulário, um por regra |
| `api.test.ts` | Token no cabeçalho, 401 com e sem token, 409, sem internet, o `allSettled`, e o DELETE do inativar (e o 404) |
| `filtrar.test.ts` | Busca vazia, sem diferenciar maiúscula, ignorando acento, e sem resultado |

O `tests/resolver-ts.mjs` ensina o Node a achar `'../config'` como `'../config.ts'` (o Metro já faz isso no app). Por isso os arquivos de `src/api` usam `import type { Sessao }`: tipo puro precisa do `type` para o Node apagar o import.

O GitHub Actions roda `npm run check` e `npm test` a cada push e pull request.
