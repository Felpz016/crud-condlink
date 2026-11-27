// O Node, sozinho, não acha "import ... from '../config'" sem a extensão.
// O Metro (que empacota o app) acha. Este gancho ensina o Node a tentar
// também "../config.ts", para os testes rodarem o MESMO código do app.
// Usado pelo "npm test" (veja o package.json).
//
// Faz parte da MUDANÇA 5 de 5 (testes automáticos). Sem este arquivo, os
// testes teriam que usar outro código (com .ts em todo import) ou instalar
// uma ferramenta a mais (como Jest). Assim, zero dependências novas.
//
// Como funciona: o Node chama este resolve para cada import. Primeiro ele
// tenta do jeito normal (proximo). Se não achar, e o import for relativo
// ('./' ou '../') e sem extensão, tenta de novo com '.ts' no fim.
import { registerHooks } from 'node:module';

registerHooks({
  resolve(especificador, contexto, proximo) {
    try {
      return proximo(especificador, contexto);
    } catch (erro) {
      const relativo = especificador.startsWith('.');
      const temExtensao = /\.[cm]?[jt]sx?$/.test(especificador);
      if (relativo && !temExtensao) {
        return proximo(especificador + '.ts', contexto);
      }
      throw erro;
    }
  },
});
