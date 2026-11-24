import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { mensagemDe } from '../servicos/http';
import { Botao } from './Botao';

interface ConfirmarInativacaoProps {
  nome: string;
  aoConfirmar: () => Promise<void>;
  aoCancelar: () => void;
}

export function ConfirmarInativacao(props: ConfirmarInativacaoProps) {
  const { nome, aoConfirmar, aoCancelar } = props;
  const [inativando, setInativando] = useState(false);
  const [erro, setErro] = useState('');

  async function confirmar() {
    setInativando(true);
    setErro('');
    try {
      await aoConfirmar();
    } catch (e) {
      setErro(mensagemDe(e));
      setInativando(false);
    }
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={aoCancelar}>
      <View style={styles.fundo}>
        <View style={styles.caixa}>
          <Text style={styles.titulo}>Inativar morador?</Text>
          <Text style={styles.texto}>
            {nome} deixa de aparecer na lista de moradores da unidade. O cadastro
            não é apagado: fica guardado como inativo.
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
    backgroundColor: 'rgba(15, 27, 51, 0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  caixa: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F1B33',
    marginBottom: 8,
  },
  texto: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 16,
  },
  erro: {
    color: '#DC2626',
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
