import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { CORES } from '../tema';

type Variante = 'primario' | 'secundario' | 'perigo';

interface BotaoProps {
  rotulo: string;
  aoTocar: () => void;
  variante?: Variante;
  carregando?: boolean;
}

// Cada variante é um par de cores. Record<Variante, ...> obriga a ter as três:
// esqueça uma e o TypeScript reclama.
const VARIANTES: Record<Variante, { fundo: string; texto: string }> = {
  primario: { fundo: CORES.primaria, texto: CORES.superficie },
  secundario: { fundo: CORES.travado, texto: CORES.noite },
  perigo: { fundo: CORES.perigo, texto: CORES.superficie },
};

export function Botao({
  rotulo,
  aoTocar,
  variante = 'primario',
  carregando = false,
}: BotaoProps) {
  const cor = VARIANTES[variante];
  return (
    <Pressable
      onPress={aoTocar}
      disabled={carregando}
      // MUDANÇA: avisa o leitor de tela (TalkBack/VoiceOver) que isto é um
      // botão e se ele está ocupado. Não muda nada visualmente.
      accessibilityRole="button"
      accessibilityState={{ busy: carregando, disabled: carregando }}
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
