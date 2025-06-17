// screens/GradeScreen.js
import React from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const dias     = ['Seg','Ter','Qua','Qui','Sex'];
const horarios = ['09 AM','10 AM','11 AM','12 PM','01 PM','02 PM', '03 PM', '04 PM'];
// Exemplo de dados; você vai buscar via API/backend:
const agendaMock = [
  { dia:0, hora:0, titulo:'Ferrine', aula: 'BD', sala:'Lab 5', cor:'#FDE68A' },
  { dia:1, hora:0, titulo:'Rogerio', aula: 'PAM', sala:'Lab 4', cor:'#A5B4FC' },
  // …outros registros…
];

// Altura fixa para cada célula (inclui vazias)
const CELL_HEIGHT = 80;

export default function GradeScreen({ route }) {
  const { escolaNome } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={[styles.container, { paddingLeft: 10 }]}>
      {/* Grid header: dias da semana */}
      <View style={styles.gridHeader}>
        <View style={[styles.timeHeader, { height: 30 }]} />
        {dias.map(d => (
          <View key={d} style={[styles.cell, styles.headerCell, { height: 30 }]}>
            <Text style={styles.headerText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Conteúdo rolável: horários × dias */}
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {horarios.map((h, rowIdx) => (
          <View style={styles.row} key={h}>
            {/* Coluna de horário */}
            <View style={[styles.timeHeader, { height: CELL_HEIGHT }]}>
              <Text style={styles.timeText}>{h}</Text>
            </View>

            {/* Células de cada dia */}
            {dias.map((_, colIdx) => {
              const aula = agendaMock.find(x => x.dia === colIdx && x.hora === rowIdx);
              return (
                <View
                  key={`${rowIdx}-${colIdx}`}
                  style={[
                    styles.cell,
                    { height: CELL_HEIGHT },
                    aula && { backgroundColor: aula.cor }
                  ]}
                >
                  {aula && (
                    <>
                      <Text style={styles.titulo}>{aula.titulo}</Text>
                      <Text style={styles.titulo}>{aula.aula}</Text>
                      <Text style={styles.sala}>{aula.sala}</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#fff', padding: 20 },
  gridHeader:   { flexDirection:'row', marginBottom:4 },
  timeHeader:   { width:60, justifyContent:'center', alignItems:'center' },
  headerCell:   { backgroundColor:'#f0f0f0' },
  headerText:   { fontWeight:'600' },
  row:          { flexDirection:'row', marginBottom:8 },
  cell:         {
    flex:1,
    marginHorizontal:4,
    borderRadius:8,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#fafafa'
  },
  timeText:     { fontSize:12, color:'#555' },
  titulo:       { fontSize:14, fontWeight:'700' },
  sala:         { fontSize:12, color:'#333', marginTop:4 },
});
