// =============================================================================
// TelaLogin.tsx: usuário e senha; chama entrar() e entrega a sessão ao App.
//
// Onde entra nas 5 mudanças: MUDANÇA 3 de 5 (sessão vencida volta ao login).
// A tela ganhou uma prop nova, aviso, e uma caixinha cinza que mostra o
// recado "Sua sessão expirou. Entre de novo." quando o App volta para cá
// sozinho. O resto da tela é igual ao PDF.
// =============================================================================
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { entrar, Sessao } from '../api/login';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { mensagemDe } from '../servicos/http';

interface TelaLoginProps {
  aoEntrar: (sessao: Sessao) => void;
  // MUDANÇA 3: quando o app volta para cá porque o token venceu, ele diz o motivo.
  // O ? deixa a prop opcional: no primeiro login ninguém passa aviso nenhum.
  aviso?: string;
}

// aviso = '' é o valor padrão: se o App não mandar aviso, ele vale texto vazio.
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

      {/* MUDANÇA 3: o aviso "Sua sessão expirou". Só aparece se houver aviso
          E não houver erro: se a pessoa errar a senha, o erro vermelho é mais
          importante, e os dois juntos confundiriam. */}
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
  // Cinza, e não vermelho, de propósito: não é um erro do usuário, é só um aviso.
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
