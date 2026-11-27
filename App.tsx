// =============================================================================
// App.tsx: o "maestro" do app. Decide qual tela aparece (carregando, login,
// erro ou moradores) olhando o estado: tem sessão? tem unidade?
//
// Onde entra nas 5 mudanças: MUDANÇA 3 de 5 (sessão vencida volta ao login).
// O caminho completo, do erro até a tela de login:
//   1. a API responde 401 a um pedido COM token (src/servicos/http.ts);
//   2. a requisicao lança um erro com o nome 'SessaoExpirada';
//   3. quem chamou pergunta sessaoExpirou(erro) e, se for, chama sessaoVenceu;
//   4. sessaoVenceu (aqui embaixo) guarda o aviso e chama o mesmo sair do botão;
//   5. sem sessão, o App mostra a TelaLogin com "Sua sessão expirou. Entre de novo."
// Resumo para a apresentação: "Antes o usuário via o erro e tinha que achar
// o botão Sair. Agora o próprio app sai e explica o motivo."
// =============================================================================
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Sessao } from './src/api/login';
import { buscarUnidade, Unidade } from './src/api/unidade';
import { Botao } from './src/componentes/Botao';
import { CabecalhoUnidade } from './src/componentes/CabecalhoUnidade';
import { apagarSessao, lerSessao, salvarSessao } from './src/servicos/armazenamento';
import { mensagemDe, sessaoExpirou } from './src/servicos/http';
import { tokenExpirado } from './src/servicos/jwt';
import { TelaLogin } from './src/telas/TelaLogin';
import { TelaMoradores } from './src/telas/TelaMoradores';

export default function App() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [unidade, setUnidade] = useState<Unidade | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erro, setErro] = useState('');
  // MUDANÇA 3: o recado que a tela de login mostra ("Sua sessão expirou").
  // Fica AQUI no App, e não na TelaLogin, porque a TelaLogin é criada de novo
  // quando o app volta para ela; o App continua vivo e lembra o recado.
  const [avisoLogin, setAvisoLogin] = useState('');

  // Ao abrir o app: tenta reaproveitar a sessão guardada no SecureStore.
  // (Esta parte é do PDF: token já vencido é apagado antes de ser usado.)
  useEffect(() => {
    async function restaurar() {
      const salva = await lerSessao();
      if (salva) {
        const anterior: Sessao = JSON.parse(salva);
        if (tokenExpirado(anterior.token)) {
          await apagarSessao();
        } else {
          setSessao(anterior);
        }
      }
      setVerificando(false);
    }
    restaurar();
  }, []);

  useEffect(() => {
    if (!sessao) {
      return;
    }
    const atual = sessao;
    async function carregarUnidade() {
      setErro('');
      try {
        setUnidade(await buscarUnidade(atual));
      } catch (e) {
        // MUDANÇA 3: token vencido volta ao login em vez de mostrar o erro.
        // No PDF aqui era só setErro(mensagemDe(e)): a tela ficava com o erro
        // e o botão Sair. Agora o erro de sessão vencida tem tratamento próprio;
        // qualquer outro erro (sem internet, API fora) continua aparecendo.
        if (sessaoExpirou(e)) {
          sessaoVenceu();
        } else {
          setErro(mensagemDe(e));
        }
      }
    }
    carregarUnidade();
  }, [sessao]);

  async function entrou(nova: Sessao) {
    await salvarSessao(JSON.stringify(nova));
    // MUDANÇA 3: entrou de novo, então o aviso "sessão expirou" some.
    setAvisoLogin('');
    setSessao(nova);
  }

  async function sair() {
    await apagarSessao();
    setUnidade(null);
    setSessao(null);
  }

  // MUDANÇA 3 (desafio "Sessão vencida" do PDF): quando a API responde 401
  // com token, o app sai sozinho e explica o motivo na tela de login.
  // Ela é passada para a TelaMoradores (prop aoSessaoExpirar), assim a tela
  // não precisa saber COMO sair: só avisa o App que a sessão venceu.
  async function sessaoVenceu() {
    setAvisoLogin('Sua sessão expirou. Entre de novo.');
    await sair();
  }

  if (verificando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#14A5C4" />
      </View>
    );
  }

  if (!sessao) {
    // MUDANÇA 3: a prop aviso leva o recado (vazio no primeiro login).
    return <TelaLogin aoEntrar={entrou} aviso={avisoLogin} />;
  }

  if (!unidade) {
    return (
      <View style={styles.centro}>
        {erro ? (
          <>
            <Text style={styles.erro}>{erro}</Text>
            <Botao rotulo="Sair" variante="secundario" aoTocar={sair} />
          </>
        ) : (
          <ActivityIndicator size="large" color="#14A5C4" />
        )}
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <CabecalhoUnidade nome={sessao.nome} unidade={unidade} aoSair={sair} />
      {/* MUDANÇA 3: aoSessaoExpirar é o "telefone" da tela para avisar o App. */}
      <TelaMoradores sessao={sessao} unidade={unidade} aoSessaoExpirar={sessaoVenceu} />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#F1F5F9',
  },
  tela: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  erro: {
    color: '#DC2626',
    textAlign: 'center',
  },
});
