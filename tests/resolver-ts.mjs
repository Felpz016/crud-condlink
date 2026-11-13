// O Node, sozinho, não acha "import ... from '../config'" sem a extensão.
// O Metro (que empacota o app) acha. Este gancho ensina o Node a tentar
// também "../config.ts", para os testes rodarem o MESMO código do app.
// Usado pelo "npm test" (veja o package.json).
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
