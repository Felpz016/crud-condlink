import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

// O Campo aceita TUDO que um TextInput aceita, mais o rótulo.
interface CampoProps extends TextInputProps {
  rotulo: string;
}

export function Campo({ rotulo, editable = true, ...resto }: CampoProps) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        style={[styles.entrada, !editable && styles.travado]}
        placeholderTextColor="#94A3B8"
        editable={editable}
        {...resto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: 14,
  },
  rotulo: {
    color: '#334155',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entrada: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0F1B33',
  },
  travado: {
    backgroundColor: '#E2E8F0',
    color: '#475569',
  },
});
