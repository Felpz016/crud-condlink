import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { entrar, Sessao } from '../api/login';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { mensagemDe } from '../servicos/http';
import { CORES } from '../tema';

interface TelaLoginProps {
  aoEntrar: (sessao: Sessao) => void;
  // MUDANÇA: quando o app volta para cá porque o token venceu, ele avisa o motivo.
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

      {aviso && !erro ? <Text style={styles.aviso}>{aviso}</Text> : null}

      <Campo
        rotulo="Usuário"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
      />
      <Campo
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        senha
        // MUDANÇA: o Enter do teclado já entra, sem precisar tocar no botão.
        returnKeyType="go"
        onSubmitEditing={tocarEntrar}
      />

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
    backgroundColor: CORES.fundo,
  },
  marca: {
    fontSize: 36,
    fontWeight: 'bold',
    color: CORES.noite,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: CORES.textoSuave,
    textAlign: 'center',
    marginBottom: 32,
  },
  aviso: {
    color: CORES.textoSuave,
    backgroundColor: CORES.travado,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  erro: {
    color: CORES.perigo,
    marginBottom: 12,
    textAlign: 'center',
  },
});
