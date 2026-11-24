import { Pressable, StyleSheet, Text, View } from 'react-native';

import { nomeDaUnidade, Unidade } from '../api/unidade';

interface CabecalhoUnidadeProps {
  nome: string;
  unidade: Unidade;
  aoSair: () => void;
}

export function CabecalhoUnidade({ nome, unidade, aoSair }: CabecalhoUnidadeProps) {
  return (
    <View style={styles.cabecalho}>
      <View style={styles.linha}>
        <Text style={styles.ola} numberOfLines={1}>
          Olá, {nome}
        </Text>
        <Pressable onPress={aoSair}>
          <Text style={styles.link}>Sair</Text>
        </Pressable>
      </View>
      <Text style={styles.condominio}>{unidade.condominio}</Text>
      <Text style={styles.unidade}>{nomeDaUnidade(unidade)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cabecalho: {
    backgroundColor: '#0F1B33',
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 4,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  ola: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 14,
  },
  condominio: {
    color: '#61DAFB',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
  },
  unidade: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  link: {
    color: '#61DAFB',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
