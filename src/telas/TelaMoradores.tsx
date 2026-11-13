import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { cadastrarMorador, DadosMorador, MORADOR_VAZIO } from '../api/cadastrarMorador';
import { editarMorador } from '../api/editarMorador';
import { inativarMorador } from '../api/inativarMorador';
import { listarMoradores, Morador } from '../api/listarMoradores';
import { Sessao } from '../api/login';
import { nomeDaUnidade, Unidade } from '../api/unidade';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { CartaoMorador, telefoneDe } from '../componentes/CartaoMorador';
import { ConfirmarInativacao } from '../componentes/ConfirmarInativacao';
import { FormularioMorador } from '../componentes/FormularioMorador';
import { mensagemDe, sessaoExpirou } from '../servicos/http';
import { CORES } from '../tema';
import { filtrarPorNome } from '../utils/filtrar';
import { formatarCpf } from '../utils/formatar';

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
  const [cadastrando, setCadastrando] = useState(false);
  // Guarda o morador cujo "Editar" foi tocado, ou null. Se há morador aqui,
  // o formulário de edição está aberto; fechar é voltar a null.
  const [editando, setEditando] = useState<Morador | null>(null);
  // Mesma ideia: o morador cujo "Inativar" foi tocado. Se há alguém aqui,
  // a janela de confirmação está aberta.
  const [inativando, setInativando] = useState<Morador | null>(null);

  // O texto digitado na busca por nome.
  const [termo, setTermo] = useState('');

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

  // MUDANÇA: toda operação que muda dados passa por aqui. Se o token venceu,
  // volta ao login e devolve false; qualquer outro erro sobe para quem chamou
  // (o FormularioMorador mostra a mensagem). Usado no cadastro, na edição e na inativação.
  async function chamarApi(acao: () => Promise<unknown>): Promise<boolean> {
    try {
      await acao();
      return true;
    } catch (e) {
      if (sessaoExpirou(e)) {
        aoSessaoExpirar();
        return false;
      }
      throw e;
    }
  }

  // Cadastra, fecha o formulário e recarrega a lista.
  async function salvarNovo(dados: DadosMorador) {
    if (await chamarApi(() => cadastrarMorador(sessao, dados))) {
      setCadastrando(false);
      await carregar();
    }
  }

  async function salvarEdicao(dados: DadosMorador) {
    if (!editando) {
      return;
    }
    const id = editando.id;
    if (await chamarApi(() => editarMorador(sessao, id, dados))) {
      setEditando(null);
      await carregar();
    }
  }

  // Inativa, fecha a janela e recarrega: o morador some da lista.
  // Se der erro, o await lança e a ConfirmarInativacao mostra a mensagem.
  async function confirmarInativacao() {
    if (!inativando) {
      return;
    }
    const id = inativando.id;
    if (await chamarApi(() => inativarMorador(sessao, id))) {
      setInativando(null);
      await carregar();
    }
  }

  // A lista que aparece na tela: a que veio da API, filtrada pela busca.
  // É calculada a cada desenho; não precisa de outro useState.
  const visiveis = filtrarPorNome(moradores, termo);
  const buscando = termo.trim() !== '';

  return (
    <View style={styles.tela}>
      <Botao rotulo="+ Cadastrar novo morador na unidade" aoTocar={() => setCadastrando(true)} />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      {/* Desafio do PDF: busca por nome. Só aparece se há alguém para buscar. */}
      {moradores.length > 0 ? (
        <View style={styles.busca}>
          <Campo
            rotulo="Buscar por nome"
            value={termo}
            onChangeText={setTermo}
            placeholder="Digite parte do nome"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      ) : null}

      {/* MUDANÇA: contador de moradores acima da lista ("2 de 5" durante a busca). */}
      {!carregando && moradores.length > 0 ? (
        <Text style={styles.contador}>
          {buscando
            ? `${visiveis.length} de ${moradores.length} na busca`
            : contarMoradores(moradores.length)}
        </Text>
      ) : null}

      <FlatList
        data={visiveis}
        keyExtractor={(morador) => morador.id}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <CartaoMorador morador={item} aoEditar={setEditando} aoInativar={setInativando} />
        )}
        // Enquanto carrega, não mostra nada (undefined). No React Native 0.88
        // (SDK 58) esta prop não aceita mais null, só undefined.
        ListEmptyComponent={
          carregando ? undefined : (
            <Text style={styles.vazio}>
              {buscando
                ? `Ninguém com "${termo.trim()}" no nome.`
                : `Nenhum outro morador ativo em ${nomeDaUnidade(unidade)}.`}
            </Text>
          )
        }
      />

      {cadastrando && (
        <FormularioMorador
          titulo="Novo morador"
          unidade={unidade}
          inicial={MORADOR_VAZIO}
          aoSalvar={salvarNovo}
          aoCancelar={() => setCadastrando(false)}
        />
      )}

      {editando && (
        <FormularioMorador
          titulo="Editar morador"
          unidade={unidade}
          inicial={paraFormulario(editando)}
          telefoneTravado
          aoSalvar={salvarEdicao}
          aoCancelar={() => setEditando(null)}
        />
      )}

      {inativando && (
        <ConfirmarInativacao
          nome={inativando.nome}
          aoConfirmar={confirmarInativacao}
          aoCancelar={() => setInativando(null)}
        />
      )}
    </View>
  );
}

// Converte o morador que veio da API nos campos do formulário, já formatados.
function paraFormulario(morador: Morador): DadosMorador {
  return {
    nome: morador.nome,
    cpf: formatarCpf(morador.cpf ?? ''),
    email: morador.email ?? '',
    telefone: telefoneDe(morador),
  };
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
  busca: {
    marginTop: 12,
    marginBottom: -14, // o Campo já tem margem embaixo; aproxima do contador
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
