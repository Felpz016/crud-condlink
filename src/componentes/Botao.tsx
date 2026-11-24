import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type Variante = 'primario' | 'secundario' | 'perigo';

interface BotaoProps {
  rotulo: string;
  aoTocar: () => void;
  variante?: Variante;
  carregando?: boolean;
}

const CORES: Record<Variante, { fundo: string; texto: string }> = {
  primario: { fundo: '#14A5C4', texto: '#FFFFFF' },
  secundario: { fundo: '#E2E8F0', texto: '#0F1B33' },
  perigo: { fundo: '#DC2626', texto: '#FFFFFF' },
};

export function Botao({
  rotulo,
  aoTocar,
  variante = 'primario',
  carregando = false,
}: BotaoProps) {
  const cor = CORES[variante];
  return (
    <Pressable
      onPress={aoTocar}
      disabled={carregando}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: cor.fundo, opacity: pressed || carregando ? 0.6 : 1 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cor.texto} />
      ) : (
        <Text style={[styles.rotulo, { color: cor.texto }]}>{rotulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
