import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Configurações fixas
const dias = ['Seg','Ter','Qua','Qui','Sex'];
const horarios = ['07:30','08:20','09:10','10:00','10:20','11:10','12:00','13:00','13:50','14:40','15:30'];
const CELL_WIDTH = 100;
const CELL_HEIGHT = 80;

// Mock de resposta da API
const agendaMock = [
  { dia: 0, hora: 0, turma: 'A', titulo: 'Prof. Ferrine', aula: 'BD', sala: 'Lab 5', cor: '#FDE68A' },
  { dia: 0, hora: 0, turma: 'B', titulo: 'Prof. Ferrine', aula: 'BD', sala: 'Lab 5', cor: '#FDE68A' },
  { dia: 1, hora: 0, turma: 'A', titulo: 'Prof. Rogerio', aula: 'PAM', sala: 'Lab 4', cor: '#A5B4FC' },
  { dia: 1, hora: 0, turma: 'B                                                                                                                                                                                                                                                                                                                                                                                                       ', titulo: 'Prof. Silva', aula: 'Redes', sala: 'Lab 8', cor: '#6EE7B7' },
  { dia: 1, hora: 1, turma: 'A', titulo: 'Prof. Costa', aula: 'SO', sala: 'Sala 2', cor: '#FDBA74' },
  { dia: 1, hora: 1, turma: 'B', titulo: 'Prof. Costa', aula: 'PAM', sala: 'Sala 2', cor: '#A5B4FC' },
  { dia: 3, hora: 2, turma: 'B', titulo: 'Prof. Lima', aula: 'POO', sala: 'Lab 1', cor: '#FCA5A5' },
];

export default function GradeScreen() {
  const insets = useSafeAreaInsets();

  // Agrupa aulas por chave para unificar divisões
  const agruparAulas = (dia, hora) => {
    const aulas = agendaMock.filter(x => x.dia === dia && x.hora === hora);
    return aulas.reduce((acc, cur) => {
      const key = `${cur.aula}|${cur.sala}|${cur.cor}`;
      const grupo = acc.find(g => g.key === key);
      if (grupo) grupo.divisions.push(cur.turma);
      else acc.push({
        key,
        aula: cur.aula,
        sala: cur.sala,
        cor: cur.cor,
        divisions: [cur.turma]
      });
      return acc;
    }, []);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <View>
          {/* Header dias da semana */}
          <View style={styles.headerRow}>
            <View style={[styles.timeHeader, { width: 60, height: 30 }]} />
            {dias.map(d => (
              <View
                key={d}
                style={[styles.headerCell, { width: CELL_WIDTH, height: 30 }]}
              >
                <Text style={styles.headerText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Conteúdo: linhas de horário */}
          {horarios.map((h, rowIdx) => (
            <View key={h} style={styles.row}>
              {/* Coluna horário */}
              <View style={[styles.timeHeader, { width: 60, height: 120 }]}>                
                <Text style={styles.timeText}>{h}</Text>
              </View>

              {/* Células de cada dia */}
              {dias.map((_, colIdx) => {
                const grupos = agruparAulas(colIdx, rowIdx);
                return (
                  <View
                    key={`${rowIdx}-${colIdx}`}
                    style={[styles.cell, { width: CELL_WIDTH, height: 120 }]}
                  >
                    {grupos.map(g => (
                      <View
                        key={g.key}
                        style={[
                          styles.aulaContainer,
                          {
                            backgroundColor: g.cor,
                            flex: 1
                          }
                        ]}
                      >
                        {/* Omite turma quando são múltiplas divisões */}
                        {g.divisions.length === 1 && (
                          <Text style={styles.turmaText}>Turma {g.divisions[0]}</Text>
                        )}
                        <Text style={styles.titulo}>{g.aula}</Text>
                        <Text style={styles.sala}>{g.sala}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ddd' },
  timeHeader: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRightWidth: 1, borderColor: '#ddd' },
  headerCell: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0', borderRightWidth: 1, borderColor: '#ddd' },
  headerText: { fontWeight: '600', fontSize: 12 },
  row: { flexDirection: 'row' },
  cell: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', borderWidth: 1, borderColor: '#eee', overflow: 'hidden' },
  timeText: { fontSize: 12, color: '#555' },
  aulaContainer: { width: '100%', borderRadius: 6, padding: 0, justifyContent: 'center', alignItems: 'center' },
  turmaText: { fontSize: 10, fontWeight: '600', marginBottom: 0  },
  titulo: { fontSize: 14, fontWeight: '700' },
  sala: { fontSize: 12, color: '#333', marginTop: 0 },
});
