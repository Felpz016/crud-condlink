import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHAVE = 'condlink_sessao';

// No celular, o SecureStore guarda no cofre do sistema: Keychain no iOS,
// Keystore no Android. No navegador ele não existe, e o único lugar é o
// localStorage, que NÃO é seguro: serve só para testar na web.

export async function salvarSessao(valor: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(CHAVE, valor);
    return;
  }
  await SecureStore.setItemAsync(CHAVE, valor);
}

export async function lerSessao(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(CHAVE);
  }
  return SecureStore.getItemAsync(CHAVE);
}

export async function apagarSessao(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(CHAVE);
    return;
  }
  await SecureStore.deleteItemAsync(CHAVE);
}
