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
  const [avisoLogin, setAvisoLogin] = useState('');

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
