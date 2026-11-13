import { StyleSheet, Text, View } from 'react-native';

import type { Morador } from '../api/listarMoradores';
import { CORES } from '../tema';
import { formatarCpf, formatarTelefone } from '../utils/formatar';

interface CartaoMoradorProps {
  morador: Morador;
}

// MUDANÇA em relação ao roteiro: no PDF o cartão de cada morador fica escrito
// dentro do renderItem da TelaMoradores, que vai crescendo a cada fase.
// Aqui ele virou um componente próprio: a tela cuida dos DADOS (carregar,
// salvar) e o cartão cuida de DESENHAR um morador.
export function CartaoMorador({ morador }: CartaoMoradorProps) {
  return (
    <View style={styles.cartao}>
      <Text style={styles.nome}>{morador.nome}</Text>
      <Text style={styles.detalhe}>CPF: {formatarCpf(morador.cpf ?? '') || '-'}</Text>
      <Text style={styles.detalhe}>Telefone: {telefoneDe(morador) || '-'}</Text>
      {morador.email ? <Text style={styles.detalhe}>E-mail: {morador.email}</Text> : null}
    </View>
  );
}

export function telefoneDe(morador: Morador): string {
  return formatarTelefone(undefined, morador.telefone ?? '');
}

const styles = StyleSheet.create({
  cartao: {
    backgroundColor: CORES.superficie,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  nome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: CORES.noite,
    marginBottom: 4,
  },
  detalhe: {
    fontSize: 14,
    color: CORES.textoSuave,
  },
});
