# Estudo para a apresentação: CRUD Condlink

Material para estudar antes de apresentar o `crud-condlink` ao prof. Arnaldo. Leia na ordem: primeiro o resumo, depois o roteiro da demonstração, e por último as perguntas. Abra o código ao lado enquanto lê.

---

## 0. O que foi feito, em ordem

O histórico do Git tem um commit por fase, como o roteiro pede (`git log --oneline`):

| Commit | O que entrou | Arquivos principais |
| --- | --- | --- |
| `Initial commit` | Projeto criado com `create-expo-app` (modelo `blank-typescript`) | `App.tsx`, `package.json` |
| `fase 1` | Login com JWT, sessão guardada no cofre, função única para falar com a API | `config.ts`, `http.ts`, `jwt.ts`, `armazenamento.ts`, `api/login.ts`, `Botao`, `Campo`, `TelaLogin` |
| `curl` | Os corpos JSON para testar o CRUD pelo terminal | `curl/*.json`, `curl/README.md` |
| `fase 2` | A unidade do morador fixa no topo | `api/unidade.ts`, `CabecalhoUnidade` |
| `fase 3` | Lista de moradores (com telefone vindo do detalhe) | `utils/formatar.ts`, `api/listarMoradores.ts`, `CartaoMorador`, `TelaMoradores` |
| `fase 4` | Cadastrar morador | `api/cadastrarMorador.ts`, `utils/validar.ts`, `FormularioMorador` |
| `fase 5` | Editar morador (telefone travado) | `api/editarMorador.ts`, estado `editando` |
| `fase 6` | Inativar morador, com confirmação | `api/inativarMorador.ts`, `ConfirmarInativacao`, estado `inativando` |
| `desafio` | Busca por nome | `utils/filtrar.ts`, campo "Buscar por nome" |
| `docs` | README, documentação, CI e simulador no navegador | `README.md`, `docs/`, `.github/workflows/ci.yml` |
| `sdk 58` | Projeto atualizado do SDK 57 para o 58, o mesmo do Expo Go do celular | `package.json`, `app.json` |

Em cada fase o código segue o PDF, com as mudanças da seção 4 (no código, procure o comentário `MUDANÇA`).

---

## 1. O app em 30 segundos

> "É o app do morador da Condlink. Eu faço login com usuário e senha, a API devolve um **token JWT**, e eu guardo esse token no **cofre do celular** com o SecureStore. Com o token, o app pergunta quem eu sou e mostra a minha **unidade** fixa no topo. Ali eu faço o **CRUD** dos outros moradores: listar (GET), cadastrar (POST), editar (PUT) e inativar (DELETE). O inativar não apaga: é **exclusão lógica**, o morador fica no banco com `ativo = 0`. Antes de programar cada operação, eu testei ela no terminal com **curl**."

Se só der tempo de dizer uma frase: **"Cada tela chama uma função de `src/api`, que chama a `requisicao`, que é o único lugar do app que faz `fetch` e põe o token no cabeçalho."**

---

## 2. Roteiro da demonstração (uns 5 minutos)

Deixe aberto antes: o app no celular (Expo Go), o VS Code no projeto, e um PowerShell com o `$H` do curl já pronto (passo 18).

| # | Mostre | Diga | Arquivo para abrir se ele pedir |
| --- | --- | --- | --- |
| 1 | Toque em Entrar com os campos vazios | "Valido antes de chamar a API." | `src/telas/TelaLogin.tsx` |
| 2 | Toque em **Mostrar** na senha, depois entre | "O token vem da API; leio o condomínio de dentro dele." | `src/api/login.ts`, `src/servicos/jwt.ts` |
| 3 | Feche o Expo Go e abra de novo | "Entrei direto: a sessão estava no SecureStore, e o token ainda não venceu." | `App.tsx` (`restaurar`) |
| 4 | O topo com condomínio e unidade | "A unidade vem do `app-pessoa-me`, não sou eu que escolho." | `src/api/unidade.ts` |
| 5 | A lista, e puxe para atualizar | "A lista não traz telefone; busco o detalhe de todos ao mesmo tempo." | `src/api/listarMoradores.ts` |
| 6 | Cadastre "Teste Felipe N", digitando o CPF | "A máscara põe os pontos sozinha. O app não manda a unidade: a API tira do token." | `FormularioMorador.tsx`, `formatar.ts` |
| 7 | Tente cadastrar o mesmo CPF de novo | "A API responde 409, e o formulário mostra o erro sem perder o que digitei." | `servicos/http.ts` |
| 8 | Edite o nome; mostre o telefone travado | "A edição desta API ignora telefone, então travei o campo." | `editarMorador.ts` |
| 9 | Digite `ana` (ou `joao`, sem acento) na busca | "Filtra na hora, sem chamar a API: a lista já está no celular. Ignora maiúscula e acento." | `utils/filtrar.ts` |
| 10 | Inative, primeiro cancelando, depois confirmando | "Ação destrutiva pede confirmação. Ele some da lista..." | `ConfirmarInativacao.tsx` |
| 11 | No PowerShell: `curl.exe -s "$URL$ID" -H $H` | "...mas continua no banco com `ativo: false`." | `curl/README.md` |
| 12 | No terminal: `npm test` | "34 testes rodando sem internet, com a API simulada." | `tests/api.test.ts` |

Antes de sair, **inative os moradores de teste**: a unidade é da turma toda.

---

## 3. Os conceitos, com as palavras para explicar

### CRUD sobre HTTP
Create, Read, Update, Delete viram métodos HTTP: **POST** cria, **GET** lê, **PUT** altera, **DELETE** apaga. Aqui as quatro operações dos moradores usam a **mesma rota** (`/residente/`); o que muda é o método e o id no fim.

### Exclusão lógica
O DELETE da Condlink não apaga a linha do banco: muda `ativo` para 0. O morador some da lista, mas o histórico da portaria continua apontando para ele. Por isso a função se chama `inativarMorador`, e não `apagarMorador`: **o nome diz o que acontece, não o método que ela usa.**

### JWT
Três partes separadas por ponto: `cabeçalho.conteúdo.assinatura`. O conteúdo é JSON em Base64URL: **codificado, não criptografado**, qualquer um lê. Mas ninguém falsifica, porque a assinatura é feita com o `JWT_SECRET`, que só o servidor tem. Mudou uma letra, a assinatura não bate e a API responde 401.

Frase para decorar: **"JWT é assinado, não secreto."**

Consequência importante: o cadastro **não manda a unidade**. A API tira a unidade do token. Se o app mandasse, bastaria trocar o número para mexer na unidade do vizinho.

### Onde fica cada coisa sensível
- `JWT_SECRET`: só no servidor.
- Endereço da API: no `.env`, numa variável `EXPO_PUBLIC_`. **Não é segredo**: tudo que é `EXPO_PUBLIC_` vai dentro do app e qualquer um lê. Está no `.env` só para não ficar espalhado no código.
- Token: no **SecureStore** (Keychain no iOS, Keystore no Android). No navegador ele não existe, e o app usa o `localStorage`, que serve só para testar.
- Senha: em lugar nenhum depois do login.

### fetch, async e await
`fetch` faz a requisição e devolve uma **Promise** (a promessa de uma resposta, porque a rede demora). `await` espera a promessa sem travar a tela, e só funciona dentro de função `async`. O `try/catch/finally` trata o erro, e o `finally` desliga o "carregando" dando certo ou não.

### A função `requisicao` (`src/servicos/http.ts`)
É o **único** lugar que faz `fetch`. Ela monta a URL, põe `Authorization: Bearer <token>`, transforma o corpo em JSON com `JSON.stringify`, e transforma a resposta ruim em erro. É genérica (`requisicao<T>`): quem chama diz o tipo da resposta, e o TypeScript passa a saber os campos.

O 401 significa coisas diferentes: **com token** é sessão vencida; **sem token** só pode ser o login, e aí é senha errada.

### Promise.all e Promise.allSettled
A lista não traz telefone, o detalhe traz. Buscar um por um com `await` dentro de um laço faria 10 moradores esperarem 10 vezes. Disparando todos juntos, demora o tempo do mais lento.
- `Promise.all`: se **um** falhar, **todos** falham (é o que o PDF usa).
- `Promise.allSettled` (o que eu usei): espera todos e diz, de cada um, se deu certo (`fulfilled`) ou não (`rejected`). Quem falhou aparece sem telefone; os outros aparecem normais.

### useState e useEffect
- `useState`: o que a tela precisa lembrar (lista, carregando, erro, quem está em edição). Trocar o estado faz o React desenhar de novo.
- `useEffect(() => {...}, [])`: roda **uma vez**, quando o app abre (é onde leio o cofre).
- `useEffect(() => {...}, [sessao])`: roda de novo **sempre que a sessão mudar** (é onde busco a unidade depois do login).

### Componente, props e "o pai decide"
O `CabecalhoUnidade` e o `CartaoMorador` não guardam estado: recebem dados e funções por **props** e só desenham. Quando o usuário toca em "Editar", o cartão **avisa** o pai (`aoEditar(morador)`), e é a `TelaMoradores` que decide o que fazer. Isso é o mesmo padrão do `aoTocar` do `Botao`.

### Formulário controlado
Os campos do morador ficam num único estado, um objeto `DadosMorador`. Cada campo mostra uma chave do objeto e, a cada letra, troca só aquela chave: `setDados({ ...dados, [campo]: valor })`. O `...dados` copia o objeto; o `[campo]` usa o **valor** da variável como nome da chave.

### Um formulário para cadastrar e editar
O `FormularioMorador` serve para os dois. O que muda vem por props: título, valores iniciais, telefone travado ou não, e a função de salvar.

### Estado que guarda o item escolhido
`editando` guarda o morador cujo botão foi tocado, ou `null`. Não preciso de um booleano a mais: **se há morador ali, o formulário está aberto**; fechar é voltar a `null`. O `inativando` (Fase 6) é igual.

### FlatList e Modal
- `FlatList` desenha só as linhas que aparecem na tela e dá o "puxar para atualizar" com `refreshing` e `onRefresh`. `keyExtractor` diz qual é a chave única de cada linha.
- `Modal` desenha uma tela por cima. Com `transparent`, a tela de trás continua aparecendo, escurecida (a confirmação de inativar).

### curl
Ferramenta para responder "o problema está no app ou na API?". Se o curl funciona e o app não, o erro é meu. Cada comando curl do roteiro corresponde a uma função de `src/api`. No PowerShell é sempre `curl.exe`, porque `curl` sozinho é apelido de outro comando.

### Códigos HTTP que aparecem
| Código | Quer dizer |
| --- | --- |
| 200 / 201 | Deu certo (201 = criado) |
| 400 | Pedido errado: campo faltando ou formato inválido |
| 401 | Quem é você? Sem token, token vencido, ou senha errada no login |
| 404 | Não encontrado, ou não é da sua unidade (a API não diz qual dos dois, de propósito) |
| 409 | Conflito: já existe esse username (o CPF) |
| 429 | Tentativas demais (5 senhas erradas em uma hora bloqueiam por uma hora) |
| 500 | Erro no servidor |

---

## 4. O que eu mudei em relação ao código do PDF

O professor deu o código; o que vale ponto é saber **por que** algo é diferente. Para cada mudança: o que é, e a frase para explicar. No código, todas estão com o comentário `MUDANÇA`.

1. **Corrigi um bug do roteiro no `lerClaims`** (`jwt.ts`).
   "O `atob` devolve bytes, um caractere por byte. Letra com acento ocupa dois bytes em UTF-8, então 'João' saía 'JoÃ£o'. Eu converto os bytes de volta em texto com `decodeURIComponent`. Quem achou o bug foi um teste automático."

2. **`Promise.allSettled` no lugar do `Promise.all`** (`listarMoradores.ts`).
   "Se um único detalhe falhasse, a tela inteira mostrava só o erro. Agora uma linha ruim não derruba as outras."

3. **Sessão vencida volta sozinha para o login** (`http.ts`, `App.tsx`, `TelaMoradores.tsx`).
   "O erro de 401 com token ganhou um nome (`SessaoExpirada`). A função `sessaoExpirou(erro)` reconhece esse erro, e aí o App apaga a sessão e mostra o login com o aviso. Na tela de moradores, toda operação passa por `chamarApi`, que faz isso num lugar só." (Era um desafio do PDF.)

4. **Mensagens de erro que o morador entende** (`http.ts`).
   "Se a API não manda o campo `error`, eu mostro uma frase pelo status: 409 vira 'Já existe um cadastro com esse CPF', 429 vira 'Tentativas demais'. Sem internet, o `fetch` nem tem resposta, ele lança um erro; eu troco por 'Sem conexão'."

5. **Máscara de CPF e telefone enquanto digita** (`formatar.ts`, `FormularioMorador.tsx`).
   "O `formatarCpf` do PDF só formata com 11 dígitos. A máscara vai pondo ponto e traço conforme os dígitos chegam, e corta no 11º." (Desafio do PDF.)

6. **Validação num arquivo separado** (`utils/validar.ts`).
   "No PDF ela ficava dentro do componente. Separada e sem React, eu consigo testar. E o e-mail agora precisa ter formato `algo@algo.algo`: o PDF aceitava `a@`."

7. **`CartaoMorador` virou componente** (`componentes/CartaoMorador.tsx`).
   "No PDF o cartão ficava dentro do `renderItem` e crescia a cada fase. Separei: a tela cuida dos dados, o cartão de desenhar e avisar qual botão foi tocado."

8. **Cores num arquivo só** (`src/tema.ts`).
   "Para mudar o azul do app inteiro, troco uma linha. É a mesma ideia dos tokens da Vitrine."

9. **Senha com Mostrar/Ocultar e Enter entra** (`Campo.tsx`, `TelaLogin.tsx`).
   "O `Campo` ganhou a prop `senha`; o `secureTextEntry` liga ou desliga conforme o estado `visivel`."

10. **Contador de moradores**, **sessão estragada não trava o app**, **acessibilidade** nos botões.

11. **Testes automáticos** (`tests/`, `npm test`) **e CI no GitHub**.
    "São 34 testes que rodam sem internet: troco o `fetch` por um falso que responde 401, 409 ou cai a rede, e confiro o que o app faz. Não gasto o usuário de teste da turma, que bloqueia com 5 erros."

12. **Fase 6 adaptada à estrutura nova**: o botão Inativar mora no `CartaoMorador`, a janela usa as cores do tema e a chamada passa pelo `chamarApi` (detalhes na seção 5).

13. **Busca por nome** (desafio do PDF): filtra na memória, sem maiúscula e sem acento (seção 5).

**O que eu não fiz de propósito**: validar os dígitos verificadores do CPF. "O roteiro manda usar CPF inventado. Com a validação, só passariam CPFs com dígitos certos, e um número assim pode ser de alguém de verdade."

---

## 5. Fase 6 e busca: como funcionam

São as duas partes mais prováveis de ele pedir para você explicar linha por linha, porque fecham o CRUD.

### Fase 6: inativar (o "D" do CRUD)

O caminho de um toque em **Inativar**:

```
CartaoMorador          toque em "Inativar" → aoInativar(morador)
   │
TelaMoradores          setInativando(morador) → a janela aparece
   │
ConfirmarInativacao    toque em "Inativar" (vermelho) → aoConfirmar()
   │
confirmarInativacao    chamarApi(() => inativarMorador(sessao, id))
   │
requisicao             DELETE .../residente/<id>, com token, sem corpo
   │
API                    ativo = 0 (o cadastro continua no banco)
   │
TelaMoradores          setInativando(null) fecha a janela; carregar() recarrega a lista
```

**`src/api/inativarMorador.ts`**: manda um `DELETE` para `ROTAS.residentes + idMorador`, com o token e **sem corpo**. É quase igual ao `editarMorador`: mesmo endereço, outro método. "Numa API REST, o endereço diz **qual** morador e o método diz **o que fazer** com ele."

**`src/componentes/ConfirmarInativacao.tsx`**: um `Modal` com `transparent`, então a lista continua aparecendo atrás, escurecida pela cor `CORES.sombra`. Ele guarda dois estados só dele: `inativando` (para o botão vermelho girar enquanto espera a API) e `erro`. Se a API recusar, o `catch` mostra a mensagem **dentro da janela**, e ela continua aberta. Se der certo, quem fecha é o pai.

**`src/componentes/CartaoMorador.tsx`**: ganhou a prop `aoInativar`, no mesmo formato da `aoEditar`. O cartão não sabe o que acontece depois do toque: só **avisa o pai** qual morador foi tocado.

**`src/telas/TelaMoradores.tsx`**:
- `const [inativando, setInativando] = useState<Morador | null>(null)`: igual ao `editando`. Se há morador ali, a janela está aberta; `null` fecha.
- `aoInativar={setInativando}`: passo a própria função `set` como prop. Quando o cartão chama `aoInativar(morador)`, é o mesmo que `setInativando(morador)`.
- `confirmarInativacao()`: confere se há alguém em `inativando` (o TypeScript passa a saber que não é `null`), guarda o `id`, chama `inativarMorador` **pelo `chamarApi`**, e, se deu certo, fecha a janela e recarrega a lista.
- `{inativando && (<ConfirmarInativacao ... />)}`: renderização condicional. A janela só existe enquanto `inativando` tem alguém.

**Por que pelo `chamarApi`?** "Se o token vencer bem na hora de inativar, o `chamarApi` reconhece o erro de sessão expirada e volta para o login. Qualquer outro erro, como um 404, ele deixa passar, e a janela mostra a mensagem."

**O que muda em relação ao PDF**: no PDF o botão Inativar fica dentro do `renderItem` da tela; aqui fica no `CartaoMorador`. As cores vêm do `tema.ts`, e a chamada passa pelo `chamarApi`. A ideia (estado com o item escolhido, `Modal transparent`, `DELETE` sem corpo) é a mesma.

### Busca por nome (desafio do PDF)

**`src/utils/filtrar.ts`**: `filtrarPorNome(moradores, termo)` devolve só quem tem o termo no nome. Três regras, cada uma com teste em `tests/filtrar.test.ts`:
1. termo vazio (ou só espaços) devolve todo mundo;
2. não diferencia maiúscula de minúscula;
3. ignora acento: `joao` acha `João`.

O truque está na função `simplificar`, usada **nos dois lados** da comparação (no nome e no termo):

```ts
texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
```

"O `normalize('NFD')` separa a letra do acento: o `ã` vira `a` mais um `~` solto. O `replace` apaga esses acentos soltos, que no Unicode ficam na faixa de `0300` a `036f`. Depois é só passar para minúsculas e comparar com `includes`."

**Na tela**: um estado `termo` ligado a um `Campo` "Buscar por nome". A lista que aparece é calculada a cada desenho:

```ts
const visiveis = filtrarPorNome(moradores, termo);
```

"Não precisa de outro `useState` para a lista filtrada: ela **deriva** de dois estados que já existem. Se eu guardasse a lista filtrada num estado, teria de lembrar de atualizar os dois juntos."

**Por que não chama a API de novo?** "A lista inteira já está na memória do celular. Filtrar ali é instantâneo, funciona sem internet e não gasta requisição."

Detalhes de tela: o contador vira "1 de 3 na busca" e, se ninguém tiver aquele nome, a lista vazia diz `Ninguém com "zzz" no nome.` em vez de "Nenhum outro morador ativo".

---

## 6. Perguntas que ele pode fazer

**Por que o token fica no SecureStore e não numa variável ou no AsyncStorage?**
Variável some quando o app fecha. AsyncStorage é texto aberto no aparelho. O SecureStore usa o cofre do sistema (Keychain/Keystore): outro app não lê e não sai em backup comum.

**O `.env` protege o endereço da API?**
Não. Tudo que começa com `EXPO_PUBLIC_` é copiado para dentro do app. O `.env` serve para não espalhar o endereço pelo código e para cada um poder apontar para outro servidor. Segredo de verdade (o `JWT_SECRET`) nunca entra no app.

**Se qualquer um lê o JWT, por que ele é seguro?**
Porque ler não dá poder de mudar. A assinatura só o servidor sabe calcular. Mudou o conteúdo, a assinatura não bate e a API recusa (401).

**Por que o cadastro não manda a unidade?**
Porque a API tira a unidade do token. Se viesse do app, bastaria trocar o número para cadastrar gente na unidade do vizinho.

**Por que o telefone fica travado na edição?**
Porque o PUT desta API ignora o telefone: responde 200, mas não muda. Um 200 quer dizer "recebi", não "fiz tudo". Travar o campo evita o usuário achar que mudou.

**Qual a diferença entre `??` e `||`?**
`a ?? b` só usa o `b` se `a` for `null` ou `undefined`. `a || b` usa o `b` também se `a` for `''`, `0` ou `false`. Exemplo no código: `formatarCpf(...) || '-'` mostra um traço quando o CPF vem vazio.

**O que o `useEffect` com `[sessao]` faz?**
Roda depois do desenho e de novo toda vez que a `sessao` mudar. É ali que, depois do login, eu busco a unidade.

**Por que `const atual = sessao` dentro do efeito?**
Dentro da função `async`, o TypeScript não tem certeza de que `sessao` continua não-nula. Guardando numa constante depois do `if (!sessao) return`, ele sabe.

**O que acontece se a internet cair no meio?**
O `fetch` lança um erro antes de ter resposta; a `requisicao` troca por "Sem conexão com a Condlink" e a tela mostra. Puxar a lista tenta de novo.

**Por que separar `src/api`, `src/servicos`, `src/componentes` e `src/telas`?**
Cada camada conversa só com a vizinha. A tela não sabe que existe HTTP; a `requisicao` não sabe que existe tela. Se a Condlink mudar uma rota, mudo só o `config.ts`.

**Como você testou sem a API?**
Com o `node:test` e um `fetch` falso (`tests/api.test.ts`): eu decido o que ele responde e confiro o comportamento. E com o curl, contra a API de verdade, antes de programar cada operação.

**O que é o `keyof DadosMorador`?**
Uma das chaves do tipo: `'nome' | 'cpf' | 'email' | 'telefone'`. Assim o `alterar(campo, valor)` só aceita um nome de campo que existe.

**Por que `Record<Variante, ...>` no Botao?**
Obriga a ter uma entrada para cada variante (`primario`, `secundario`, `perigo`). Se eu esquecer uma, o TypeScript reclama.

---

## 7. Cola: arquivo por arquivo

| Arquivo | Em uma frase |
| --- | --- |
| `App.tsx` | Decide a tela: girando, login, girando a unidade, ou cabeçalho + moradores. |
| `src/config.ts` | Endereço da API (do `.env`) e as três rotas. |
| `src/tema.ts` | Todas as cores. |
| `src/servicos/http.ts` | A única função que faz `fetch`: token, JSON e erros. |
| `src/servicos/jwt.ts` | Lê o meio do token e diz se venceu. |
| `src/servicos/armazenamento.ts` | Salva, lê e apaga a sessão no cofre (ou no `localStorage` na web). |
| `src/api/login.ts` | POST do login; tira o condomínio do token. |
| `src/api/unidade.ts` | GET de "quem sou eu" e o texto "Bloco A - Apto 102". |
| `src/api/listarMoradores.ts` | GET da lista + detalhes ao mesmo tempo. |
| `src/api/cadastrarMorador.ts` | POST; username é o CPF, senha provisória sorteada. |
| `src/api/editarMorador.ts` | PUT parcial, sem telefone. |
| `src/api/inativarMorador.ts` | DELETE sem corpo (exclusão lógica). |
| `src/telas/TelaLogin.tsx` | Usuário, senha, Entrar. |
| `src/telas/TelaMoradores.tsx` | Lista, busca e os estados `cadastrando`, `editando`, `inativando`. |
| `src/componentes/Botao.tsx` | Botão com três variantes e o girando. |
| `src/componentes/Campo.tsx` | Rótulo + TextInput, com o Mostrar/Ocultar de senha. |
| `src/componentes/CabecalhoUnidade.tsx` | Topo escuro com o nome, o condomínio e a unidade. |
| `src/componentes/CartaoMorador.tsx` | Um morador e os botões Editar e Inativar. |
| `src/componentes/FormularioMorador.tsx` | Modal de cadastrar/editar, com máscaras. |
| `src/componentes/ConfirmarInativacao.tsx` | "Inativar morador?", com Cancelar e o botão vermelho. |
| `src/utils/formatar.ts` | CPF e telefone: formatar, separar, mascarar. |
| `src/utils/validar.ts` | O primeiro problema do formulário, ou vazio. |
| `src/utils/filtrar.ts` | Busca por nome, sem maiúscula e sem acento. |

---

## 8. Cola de sintaxe

| Código | Quer dizer |
| --- | --- |
| `async function f() { await x }` | Espera uma Promise sem travar a tela |
| `Promise.allSettled(lista.map(...))` | Várias promessas juntas; diz o resultado de cada uma |
| `function f<T>(): Promise<T>` | Genérico: quem chama escolhe o tipo |
| `interface A extends B` | A tem tudo de B e mais o que declarar |
| `campo?: string \| null` | Pode faltar, ou vir `null` |
| `'a' \| 'b'` | Tipo união |
| `keyof Tipo` | Uma das chaves do tipo |
| `Record<K, V>` | Objeto com chaves K e valores V |
| `a ?? b` | `b` se `a` for `null`/`undefined` |
| `obj?.campo`, `lista?.[0]` | Não quebra se não existir |
| `{ ...obj, [chave]: v }` | Copia o objeto trocando uma chave variável |
| `({ a, ...resto })` | Tira `a` e junta o resto |
| `import type { X }` | Importa só o tipo (some no JavaScript) |
| `{cond && <A />}` | Desenha `A` só se `cond` for verdadeira |

---

## 9. Se ele perguntar sobre o SDK

O roteiro manda criar o projeto com o mesmo SDK do Expo Go (57 ou 58). O projeto começou no 57 e foi atualizado para o **58** no commit `sdk 58`, porque o Expo Go do celular já estava no 58: **o Expo Go só abre projetos do SDK dele**. A atualização é feita com `npx expo install expo@^58` seguido de `npx expo install --fix`, que acerta a versão de cada biblioteca para o SDK novo. A única mudança no código foi uma linha na `TelaMoradores`: no React Native 0.88 o `ListEmptyComponent` não aceita mais `null`, então passou a receber `undefined` enquanto a lista carrega.
