// screens/EscolasScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TouchableOpacity, StyleSheet, FlatList, View } from 'react-native';


const ESCOLAS = [
  {
    nome: 'Prof. Ilza Nascimento Pintus',
    turmas: ['1º ano A', '2º ano B', '3º ano C'],
  },
  {
    nome: 'EE Prof. Alceu Maynard Araujo',
    turmas: ['1º ano A', '1º ano B', '2º ano A'],
  },
];

export default function EscolasScreen({ navigation }) {
  // Map de nomes de escola para boolean
  const [expanded, setExpanded] = useState({});
  
  const toggleExpand = (escolaNome) => {
    setExpanded(prev => ({
      ...prev,
      [escolaNome]: !prev[escolaNome],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Escolas</Text>

      <FlatList
        data={ESCOLAS}
        keyExtractor={e => e.nome}
        renderItem={({ item }) => {
          const isOpen = !!expanded[item.nome];
          return (
            <>
              <TouchableOpacity
                style={styles.card}
                onPress={() => toggleExpand(item.nome)}
              >
                <Text style={styles.cardText}>{item.nome}</Text>
                <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>
                  {isOpen ? '˅' : '›'}
                </Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.dropdown}>
                  {item.turmas.map(turma => (
                    <TouchableOpacity
                      key={turma}
                      style={styles.dropdownItem}
                      onPress={() =>
                        navigation.navigate('Grade', {
                          escolaNome: item.nome,
                          turma,
                        })
                      }
                    >
                      <Text style={styles.dropdownText}>{turma}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          );
        }}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20 },
  tabContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  tab: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#4CD964' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#333' },
  tabTextActive: { color: '#fff' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardText: { fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 18, color: '#999' },
    chevronOpen: {
    transform: [{ rotate: '90deg' }],
  },
  dropdown: {
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: '#555',
  },
});
