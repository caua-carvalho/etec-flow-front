// screens/ConfiguracoesScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ConfiguracoesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Configurações</Text>
      {/* Insira aqui os controles de perfil, toggles e demais ajustes corporativos */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: '600' },
});
