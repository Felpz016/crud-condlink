import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { mensagemDe } from '../servicos/http';
import { CORES } from '../tema';
import { Botao } from './Botao';

interface ConfirmarInativacaoProps {
  nome: string;
  aoConfirmar: () => Promise<void>;
  aoCancelar: () => void;
}

// Ação que o usuário não desfaz sozinho pede uma pergunta antes, com o botão
// perigoso em vermelho e o Cancelar ao lado.
export function ConfirmarInativacao(props: ConfirmarInativacaoProps) {
  const { nome, aoConfirmar, aoCancelar } = props;
  const [inativando, setInativando] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    setInativando(true);
    setErro('');
    try {
      await aoConfirmar();
      // Deu certo: quem chamou fecha esta janela (some do JSX).
    } catch (e) {
      // A API recusou (404, por exemplo): a janela continua aberta com o motivo.
      setErro(mensagemDe(e));
      setInativando(false);
    }
  }

  return (
    // transparent: o Modal não pinta fundo, então a lista continua visível atrás.
    <Modal visible transparent animationType="fade" onRequestClose={aoCancelar}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>Inativar morador?</Text>
          <Text style={styles.texto}>
            {nome} deixa de aparecer na lista de moradores da unidade. O cadastro não é
            apagado: fica guardado como inativo.
          </Text>

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <View style={styles.botoes}>
            <View style={styles.botao}>
              <Botao rotulo="Cancelar" variante="secundario" aoTocar={aoCancelar} />
            </View>
            <View style={styles.botao}>
              <Botao
                rotulo="Inativar"
                variante="perigo"
                aoTocar={confirmar}
                carregando={inativando}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: CORES.sombra, // azul-noite com 60% de opacidade: escurece sem esconder
    justifyContent: 'center',
    padding: 24,
  },
  caixa: {
    backgroundColor: CORES.superficie,
    borderRadius: 14,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORES.noite,
    marginBottom: 8,
  },
  texto: {
    fontSize: 15,
    color: CORES.texto,
    marginBottom: 16,
  },
  erro: {
    color: CORES.perigo,
    marginBottom: 12,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
  },
  botao: {
    flex: 1,
  },
});
