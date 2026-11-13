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
import { CORES } from './src/tema';

export default function App() {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [unidade, setUnidade] = useState<Unidade | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [erro, setErro] = useState('');
  // MUDANÇA: recado para a tela de login ("sua sessão expirou").
  const [avisoLogin, setAvisoLogin] = useState('');

  // Roda UMA vez, quando o app abre: procura uma sessão guardada no cofre.
  useEffect(() => {
    async function restaurar() {
      try {
        const salva = await lerSessao();
        if (salva) {
          const anterior: Sessao = JSON.parse(salva);
          if (tokenExpirado(anterior.token)) {
            await apagarSessao();
          } else {
            setSessao(anterior);
          }
        }
      } catch {
        // MUDANÇA: sessão estragada no cofre não deixa o app girando para sempre.
        await apagarSessao();
      } finally {
        setVerificando(false);
      }
    }
    restaurar();
  }, []);

  // Sempre que houver uma sessão nova, busca a unidade de quem entrou.
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

  // MUDANÇA (desafio "Sessão vencida" do PDF): quando a API responde 401 com
  // token, o app sai sozinho e explica o motivo na tela de login.
  async function sessaoVenceu() {
    setAvisoLogin('Sua sessão expirou. Entre de novo.');
    await sair();
  }

  if (verificando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={CORES.primaria} />
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
          <ActivityIndicator size="large" color={CORES.primaria} />
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
    backgroundColor: CORES.fundo,
  },
  tela: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },
  erro: {
    color: CORES.perigo,
    textAlign: 'center',
  },
});
