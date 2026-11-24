import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { cadastrarMorador, DadosMorador, MORADOR_VAZIO } from '../api/cadastrarMorador';
import { editarMorador } from '../api/editarMorador';
import { inativarMorador } from '../api/inativarMorador';
import { listarMoradores, Morador } from '../api/listarMoradores';
import { Sessao } from '../api/login';
import { nomeDaUnidade, Unidade } from '../api/unidade';
import { Botao } from '../componentes/Botao';
import { ConfirmarInativacao } from '../componentes/ConfirmarInativacao';
import { FormularioMorador } from '../componentes/FormularioMorador';
import { mensagemDe, sessaoExpirou } from '../servicos/http';
import { formatarCpf, formatarTelefone } from '../utils/formatar';

interface TelaMoradoresProps {
  sessao: Sessao;
  unidade: Unidade;
  // MUDANÇA 3: a tela avisa o App quando o token venceu, e o App volta ao login.
  aoSessaoExpirar: () => void;
}

export function TelaMoradores({ sessao, unidade, aoSessaoExpirar }: TelaMoradoresProps) {
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [cadastrando, setCadastrando] = useState(false);
  const [editando, setEditando] = useState<Morador | null>(null);
  const [inativando, setInativando] = useState<Morador | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setMoradores(await listarMoradores(sessao));
    } catch (e) {
      // MUDANÇA 3: token vencido não vira mensagem; o app volta ao login.
      if (sessaoExpirou(e)) {
        aoSessaoExpirar();
        return;
      }
      setErro(mensagemDe(e));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, [sessao.token]);

  // MUDANÇA 3: cadastrar, editar e inativar passam por aqui. Se o token
  // venceu, volta ao login e devolve false; qualquer outro erro sobe para
  // quem chamou (o formulário ou a janela de confirmação mostram a mensagem).
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

  return (
    <View style={styles.tela}>
      <Botao
        rotulo="+ Cadastrar novo morador na unidade"
        aoTocar={() => setCadastrando(true)}
      />
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <FlatList
        data={moradores}
        keyExtractor={(morador) => morador.id}
        refreshing={carregando}
        onRefresh={carregar}
        contentContainerStyle={styles.lista}
        renderItem={({ item }) => (
          <View style={styles.cartao}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.detalhe}>CPF: {formatarCpf(item.cpf ?? '') || '-'}</Text>
            <Text style={styles.detalhe}>Telefone: {telefoneDe(item) || '-'}</Text>
            <View style={styles.acoes}>
              <View style={styles.acao}>
                <Botao
                  rotulo="Editar morador"
                  variante="secundario"
                  aoTocar={() => setEditando(item)}
                />
              </View>
              <View style={styles.acao}>
                <Botao
                  rotulo="Inativar"
                  variante="perigo"
                  aoTocar={() => setInativando(item)}
                />
              </View>
            </View>
          </View>
        )}
        // No PDF é "carregando ? null : ...". No React Native 0.88 (SDK 58)
        // esta prop não aceita mais null, então usamos undefined.
        ListEmptyComponent={
          carregando ? undefined : (
            <Text style={styles.vazio}>
              Nenhum outro morador ativo em {nomeDaUnidade(unidade)}.
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

function telefoneDe(morador: Morador): string {
  return formatarTelefone(undefined, morador.telefone ?? '');
}

function paraFormulario(morador: Morador): DadosMorador {
  return {
    nome: morador.nome,
    cpf: formatarCpf(morador.cpf ?? ''),
    email: morador.email ?? '',
    telefone: telefoneDe(morador),
  };
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    padding: 16,
  },
  lista: {
    paddingTop: 12,
  },
  cartao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  nome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F1B33',
    marginBottom: 4,
  },
  detalhe: {
    fontSize: 14,
    color: '#475569',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  acao: {
    flex: 1,
  },
  erro: {
    color: '#DC2626',
    marginTop: 12,
  },
  vazio: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 24,
  },
});
