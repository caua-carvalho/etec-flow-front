// SemanalScreen.js

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, SectionList, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { parse, differenceInMinutes, format } from 'date-fns';

const ITEM_HEIGHT = 100;
const HEADER_HEIGHT = 40;
const WEEK_DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

export function useCurrentDate(overrideDate = null) {
  const [forcedDate] = useState(overrideDate);
  return forcedDate ?? new Date();
}

function getNextLessonInfo(agenda, currentDayIndex, now) {
  const todayLessons = agenda
    .filter(item => item.dayIndex === currentDayIndex)
    .map(item => ({
      ...item,
      startDate: parse(item.start, 'hh:mm a', now),
    }));
  const futureLessons = todayLessons
    .filter(item => item.startDate > now)
    .sort((a, b) => a.startDate - b.startDate);
  if (!futureLessons.length) return null;
  const nextLesson = futureLessons[0];
  const minutesUntil = differenceInMinutes(nextLesson.startDate, now);
  return { nextLesson, minutesUntil };
}

function formatDate(d) {
  return `${d.getDate().toString().padStart(2,'0')} de ${d.toLocaleString('pt-BR',{ month:'long' })}, ${d.getFullYear()}`;
}

export default function SemanalScreen({ professorId = 1, testDate = null }) {
  const insets = useSafeAreaInsets();
  const currentDate = useCurrentDate(testDate);
  const sectionListRef = useRef(null);

  const [agenda, setAgenda]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const [anchor, setAnchor]       = useState(() => {
    const hoje = new Date(currentDate);
    hoje.setHours(0,0,0,0);
    return hoje;
  });
  const [selectedIndex, setSelectedIndex] = useState(anchor.getDay());
  const tabBarHeight = 60 + insets.bottom;

  const weekDates = useMemo(() => {
    const start = new Date(anchor);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0,0,0,0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [anchor]);

  useEffect(() => { setSelectedIndex(anchor.getDay()); }, [anchor]);

  useEffect(() => {
    async function loadAgenda() {
      setIsLoading(true);
      try {
        const res  = await fetch(
          `https://etec-flow.fwh.is/professor/grade_semana.php?professor_id=1`,
          { headers: { Accept: 'application/json' } }
        );
        const text = await res.text();

        if (!res.ok) {
          console.error('API status inválido:', text);
          throw new Error(`HTTP ${res.status}`);
        }
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          console.error('Resposta não-JSON:', text);
          throw new Error('Resposta inesperada (não é JSON)');
        }

        let raw;
        try { raw = JSON.parse(text); }
        catch {
          console.error('Falha no JSON.parse:', text);
          throw new Error('JSON inválido');
        }

        const transformed = raw.map(item => ({
          dayIndex: item.dia_semana,
          start:    format(parse(item.horario_inicio, 'HH:mm:ss', new Date()), 'hh:mm a'),
          end:      format(parse(item.horario_fim,    'HH:mm:ss', new Date()), 'hh:mm a'),
          title:    item.disciplina,
          room:     item.sala,
          school:   item.turma,
          color:    item.cor_evento,
        }));

        setAgenda(transformed);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar grade semanal:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAgenda();
  }, [professorId]);

  const nextLessonInfo = useMemo(
    () => getNextLessonInfo(agenda, selectedIndex, currentDate),
    [agenda, selectedIndex, currentDate]
  );

  const hojeSectionData = useMemo(() => {
    const now = currentDate;
    return Object.entries(
      agenda
        .filter(item => item.dayIndex === selectedIndex)
        .map(item => {
          const start = parse(item.start, 'hh:mm a', now);
          const end   = parse(item.end,   'hh:mm a', now);
          return {
            ...item,
            startDate:     start,
            isNow:         now >= start && now <= end,
            isPast:        now > end,
            minutesUntil:  start > now ? differenceInMinutes(start, now) : null,
          };
        })
        .reduce((acc, item) => {
          (acc[item.school] = acc[item.school] || []).push(item);
          return acc;
        }, {})
    ).map(([title, data]) => ({ title, data }));
  }, [agenda, selectedIndex, currentDate]);

  useEffect(() => {
    const secIdx = hojeSectionData.findIndex(sec => sec.data.some(it => it.isNow));
    if (secIdx >= 0 && sectionListRef.current) {
      const itIdx = hojeSectionData[secIdx].data.findIndex(it => it.isNow);
      sectionListRef.current.scrollToLocation({
        sectionIndex: secIdx,
        itemIndex:    itIdx,
        viewPosition: 0.5,
        animated:     true,
      });
    }
  }, [hojeSectionData]);

  function prevWeek() {
    setAnchor(cur => { const n = new Date(cur); n.setDate(n.getDate() - 7); n.setHours(0,0,0,0); return n; });
  }
  function nextWeek() {
    setAnchor(cur => { const n = new Date(cur); n.setDate(n.getDate() + 7); n.setHours(0,0,0,0); return n; });
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Erro ao carregar agenda:{'\n'}{error.message}
        </Text>
      </SafeAreaView>
    );
  }

  const headerDate = weekDates[selectedIndex];
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={prevWeek}>
          <Ionicons name="chevron-back-outline" size={24} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{formatDate(headerDate)}</Text>
          {nextLessonInfo ? (
            <Text style={styles.upcomingBadge}>
              Próxima: {nextLessonInfo.nextLesson.title} em{' '}
              {Math.floor(nextLessonInfo.minutesUntil/60)}h {nextLessonInfo.minutesUntil%60}m
            </Text>
          ) : (
            <Text style={styles.upcomingBadge}>Sem mais aulas hoje</Text>
          )}
        </View>
        <TouchableOpacity onPress={nextWeek}>
          <Ionicons name="chevron-forward-outline" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekContainer}>
        <FlatList
          data={weekDates}
          keyExtractor={d => d.toISOString()}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekList}
          renderItem={({ item, index }) => {
            const selected = index === selectedIndex;
            return (
              <TouchableOpacity
                style={[styles.dayBox, selected && styles.dayBoxActive]}
                onPress={() => { setAnchor(new Date(item)); setSelectedIndex(index); }}>
                <Text style={[styles.dayNum, selected && styles.dayNumActive]}>
                  {item.getDate()}
                </Text>
                <Text style={[styles.dayName, selected && styles.dayNameActive]}>
                  {WEEK_DAYS[item.getDay()]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <SectionList
        ref={sectionListRef}
        sections={hojeSectionData}
        keyExtractor={(item, idx) => `${item.start}-${idx}`}
        renderSectionHeader={({ section:{ title } }) => (
          <View style={styles.viewSchoolTitle}>
            <Text style={styles.schoolTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const borderColor = item.isNow ? '#4CD964' : '#ddd';
          const isNext = nextLessonInfo && item.startDate.getTime() === nextLessonInfo.nextLesson.startDate.getTime();
          return (
            <View style={[styles.card, { borderColor }, item.isPast && styles.cardPast]}>
              <View style={styles.left}>
                <View style={styles.times}>
                  <Text style={styles.time}>{item.start}</Text>
                  <Text style={styles.time}>{item.end}</Text>
                </View>
                <View style={{
                  width: item.isNow ? 1 : 0.5,
                  height: '80%',
                  backgroundColor: item.isNow ? '#4CD964' : '#222',
                  marginHorizontal: 16,
                }} />
                <View>
                  <Text style={styles.lesson}>{item.title}</Text>
                  <Text style={styles.room}>{item.room}</Text>
                </View>
              </View>
              <View style={styles.right}>
                {item.isNow ? (
                  <Text style={styles.badgeNow}>Agora</Text>
                ) : isNext ? (
                  <Text style={styles.badgeLater}>
                    {Math.floor(item.minutesUntil/60)}h {item.minutesUntil%60}m
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: tabBarHeight+20 }}
        stickySectionHeadersEnabled={false}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: index*ITEM_HEIGHT + HEADER_HEIGHT,
          index
        })}
        onScrollToLocationFailed={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff', padding: 20 },
  header:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:5 },
  headerCenter:    { alignItems:'center' },
  headerTitle:     { fontSize:18, fontWeight:'700' },
  upcomingBadge:   { fontSize:12, fontWeight:'600', color:'#4CD964', marginTop:4 },
  weekContainer:   { flexDirection:'row', justifyContent:'center', marginBottom:5 },
  weekList:        { paddingVertical:12, flex:1, justifyContent:'center', alignItems:'center' },
  dayBox:          { width:48, height:80, marginHorizontal:1, borderRadius:8, backgroundColor:'#f5f5f7', justifyContent:'center', alignItems:'center' },
  dayBoxActive:    { backgroundColor:'#4CD964' },
  dayNum:          { fontSize:16, fontWeight:'700', color:'#333', marginBottom:4 },
  dayNumActive:    { color:'#fff' },
  dayName:         { fontSize:12, color:'#666' },
  dayNameActive:   { color:'#fff' },
  viewSchoolTitle: { width:'100%', justifyContent:'center', alignItems:'center' },
  schoolTitle:     { fontSize:20, fontWeight:'700', marginVertical:12, width:'50%', textAlign:'center' },
  card:            { flexDirection:'row', justifyContent:'space-between', padding:16, marginBottom:12, borderRadius:8, borderWidth:1, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:4, elevation:2, backgroundColor:'#fafafa' },
  left:            { flexDirection:'row', alignItems:'center' },
  times:           { marginLeft:8, marginRight:12 },
  time:            { fontSize:14, fontWeight:'600', color:'#333' },
  room:            { fontSize:12, color:'#555' },
  lesson:          { fontSize:16, fontWeight:'700' },
  right:           { alignItems:'flex-end', flex:1 },
  badgeNow:        { marginTop:4, fontSize:12, fontWeight:'600', color:'#4CD964' },
  badgeLater:      { marginTop:4, fontSize:12, fontWeight:'600', color:'#666' },
  cardPast:        { opacity:0.5 },
  errorText:       { color:'red', textAlign:'center', marginTop:50 },
});
