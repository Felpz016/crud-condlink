import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DadosMorador } from '../api/cadastrarMorador';
import { nomeDaUnidade, Unidade } from '../api/unidade';
import { mensagemDe } from '../servicos/http';
import { CORES } from '../tema';
import { mascararCpf, mascararTelefone } from '../utils/formatar';
import { validarMorador } from '../utils/validar';
import { Botao } from './Botao';
import { Campo } from './Campo';

interface FormularioMoradorProps {
  titulo: string;
  unidade: Unidade;
  inicial: DadosMorador;
  telefoneTravado?: boolean;
  aoSalvar: (dados: DadosMorador) => Promise<void>;
  aoCancelar: () => void;
}

// O mesmo formulário serve para cadastrar (fase 4) e editar (fase 5):
// o que muda vem por props.
export function FormularioMorador(props: FormularioMoradorProps) {
  const { titulo, unidade, inicial, telefoneTravado = false, aoSalvar, aoCancelar } = props;
  const [dados, setDados] = useState<DadosMorador>(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Um alterar para todos os campos: [campo] usa o VALOR da variável como nome.
  function alterar(campo: keyof DadosMorador, valor: string) {
    setDados({ ...dados, [campo]: valor });
  }

  async function salvar() {
    const problema = validarMorador(dados, telefoneTravado);
    if (problema) {
      setErro(problema);
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await aoSalvar(dados);
    } catch (e) {
      // A API recusou (409, 400...): mostra aqui e o usuário não perde o que digitou.
      setErro(mensagemDe(e));
      setSalvando(false);
    }
  }

  return (
    <Modal visible animationType="slide" onRequestClose={aoCancelar}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>{titulo}</Text>

        <Campo rotulo="Unidade" value={nomeDaUnidade(unidade)} editable={false} />
        <Campo rotulo="Nome" value={dados.nome} onChangeText={(v) => alterar('nome', v)} />
        <Campo
          rotulo="CPF"
          value={dados.cpf}
          // MUDANÇA (desafio do PDF): a máscara põe pontos e traço enquanto digita.
          onChangeText={(v) => alterar('cpf', mascararCpf(v))}
          keyboardType="number-pad"
          placeholder="000.000.000-00"
          maxLength={14}
        />
        <Campo
          rotulo="E-mail"
          value={dados.email}
          onChangeText={(v) => alterar('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Campo
          rotulo="Telefone"
          value={dados.telefone}
          // MUDANÇA: máscara também no telefone: (16) 3333-4444 ou (16) 99999-8888.
          onChangeText={(v) => alterar('telefone', mascararTelefone(v))}
          keyboardType="phone-pad"
          placeholder="(16) 3333-4444"
          maxLength={15}
          editable={!telefoneTravado}
        />
        {telefoneTravado ? (
          <Text style={styles.aviso}>O telefone só pode ser informado no cadastro.</Text>
        ) : null}

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <View style={styles.botoes}>
          <View style={styles.botao}>
            <Botao rotulo="Cancelar" variante="secundario" aoTocar={aoCancelar} />
          </View>
          <View style={styles.botao}>
            <Botao rotulo="Salvar" aoTocar={salvar} carregando={salvando} />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  conteudo: {
    padding: 24,
    paddingTop: 56,
    backgroundColor: CORES.fundo,
    flexGrow: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CORES.noite,
    marginBottom: 20,
  },
  aviso: {
    color: CORES.textoApagado,
    fontSize: 13,
    marginTop: -8,
    marginBottom: 14,
  },
  erro: {
    color: CORES.perigo,
    marginBottom: 12,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  botao: {
    flex: 1,
  },
});
