import { Pressable, StyleSheet, Text, View } from 'react-native';

import { nomeDaUnidade, Unidade } from '../api/unidade';
import { CORES } from '../tema';

interface CabecalhoUnidadeProps {
  nome: string;
  unidade: Unidade;
  aoSair: () => void;
}

// Componente controlado pelo pai: não guarda estado, só desenha o que recebe.
export function CabecalhoUnidade({ nome, unidade, aoSair }: CabecalhoUnidadeProps) {
  return (
    <View style={styles.cabecalho}>
      <View style={styles.linha}>
        <Text style={styles.ola} numberOfLines={1}>
          Olá, {nome}
        </Text>
        <Pressable onPress={aoSair} accessibilityRole="button" hitSlop={12}>
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
    backgroundColor: CORES.noite,
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
    color: CORES.borda,
    fontSize: 14,
  },
  condominio: {
    color: CORES.destaque,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
  },
  unidade: {
    color: CORES.superficie,
    fontSize: 22,
    fontWeight: 'bold',
  },
  link: {
    color: CORES.destaque,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
