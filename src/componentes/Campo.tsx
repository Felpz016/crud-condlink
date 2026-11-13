import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { CORES } from '../tema';

// O Campo aceita TUDO que um TextInput aceita, mais o rótulo.
interface CampoProps extends TextInputProps {
  rotulo: string;
  // MUDANÇA em relação ao roteiro: campo de senha com o botão Mostrar/Ocultar
  // (o mesmo desafio que fizemos no login da Vitrine, na Aula 07).
  senha?: boolean;
}

export function Campo({ rotulo, senha = false, editable = true, ...resto }: CampoProps) {
  // Só faz sentido no campo de senha: começa escondida.
  const [visivel, setVisivel] = useState(false);

  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <View style={styles.linha}>
        <TextInput
          style={[styles.entrada, !editable && styles.travado]}
          placeholderTextColor={CORES.placeholder}
          editable={editable}
          // senha escondida = bolinhas. Se o usuário tocou em Mostrar, aparecem as letras.
          secureTextEntry={senha && !visivel}
          {...resto}
        />
        {senha ? (
          <Pressable
            style={styles.olho}
            onPress={() => setVisivel(!visivel)}
            accessibilityRole="button"
          >
            <Text style={styles.olhoTexto}>{visivel ? 'Ocultar' : 'Mostrar'}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: 14,
  },
  rotulo: {
    color: CORES.texto,
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entrada: {
    flex: 1,
    backgroundColor: CORES.superficie,
    borderColor: CORES.borda,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: CORES.noite,
  },
  travado: {
    backgroundColor: CORES.travado,
    color: CORES.textoSuave,
  },
  olho: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  olhoTexto: {
    color: CORES.primaria,
    fontWeight: 'bold',
  },
});
