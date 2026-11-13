import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { listarMoradores, Morador } from '../api/listarMoradores';
import { Sessao } from '../api/login';
import { nomeDaUnidade, Unidade } from '../api/unidade';
import { CartaoMorador } from '../componentes/CartaoMorador';
import { mensagemDe, sessaoExpirou } from '../servicos/http';
import { CORES } from '../tema';

interface TelaMoradoresProps {
  sessao: Sessao;
  unidade: Unidade;
  // MUDANÇA: a tela avisa o App quando o token venceu, e o App volta ao login.
  aoSessaoExpirar: () => void;
}

export function TelaMoradores({ sessao, unidade, aoSessaoExpirar }: TelaMoradoresProps) {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setMoradores(await listarMoradores(sessao));
    } catch (e) {
      if (sessaoExpirou(e)) {
        aoSessaoExpirar();
        return;
      }
      setErro(mensagemDe(e));
    } finally {
      setCarregando(false);
    }
  }

  // Busca a lista quando a tela aparece.
  useEffect(() => {
    carregar();
  }, [sessao.token]);

  return (
    <View style={styles.tela}>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {/* MUDANÇA: contador de moradores acima da lista. */}
      {!carregando && moradores.length > 0 ? (
        <Text style={styles.contador}>{contarMoradores(moradores.length)}</Text>
      ) : null}

      <FlatList
        data={moradores}
        keyExtractor={(morador) => morador.id}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => <CartaoMorador morador={item} />}
        ListEmptyComponent={
          carregando ? null : (
            <Text style={styles.vazio}>
              Nenhum outro morador ativo em {nomeDaUnidade(unidade)}.
            </Text>
          )
        }
      />
    </View>
  );
}

// "1 morador ativo" / "3 moradores ativos": singular e plural certos.
function contarMoradores(total: number): string {
  return total === 1 ? '1 morador ativo' : `${total} moradores ativos`;
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    padding: 16,
  },
  lista: {
    paddingTop: 12,
  },
  contador: {
    color: CORES.textoApagado,
    fontSize: 13,
    marginTop: 12,
  },
  erro: {
    color: CORES.perigo,
    marginTop: 12,
  },
  vazio: {
    textAlign: 'center',
    color: CORES.textoApagado,
    marginTop: 24,
  },
});
