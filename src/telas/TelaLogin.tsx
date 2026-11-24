import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { entrar, Sessao } from '../api/login';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { mensagemDe } from '../servicos/http';

interface TelaLoginProps {
  aoEntrar: (sessao: Sessao) => void;
  // MUDANÇA 3: quando o app volta para cá porque o token venceu, ele diz o motivo.
  aviso?: string;
}

export function TelaLogin({ aoEntrar, aviso = '' }: TelaLoginProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function tocarEntrar() {
    if (!usuario.trim() || !senha) {
      setErro('Informe usuário e senha.');
      return;
    }
    setCarregando(true);
    setErro('');
    try {
      const sessao = await entrar(usuario.trim(), senha);
      aoEntrar(sessao);
    } catch (e) {
      setErro(mensagemDe(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.tela}>
      <Text style={styles.marca}>Condlink</Text>
      <Text style={styles.subtitulo}>Moradores da minha unidade</Text>

      {/* MUDANÇA 3: o aviso "Sua sessão expirou" */}
      {aviso && !erro ? <Text style={styles.aviso}>{aviso}</Text> : null}

      <Campo
        rotulo="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Campo rotulo="Senha" value={senha} onChangeText={setSenha} secureTextEntry />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Botao rotulo="Entrar" aoTocar={tocarEntrar} carregando={carregando} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F1F5F9',
  },
  marca: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0F1B33',
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 32,
  },
  // MUDANÇA 3: caixinha cinza com o aviso de sessão expirada.
  aviso: {
    color: '#475569',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  erro: {
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
});
