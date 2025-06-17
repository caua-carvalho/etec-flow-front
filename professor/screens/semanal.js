import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SectionList,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { parse, differenceInMinutes } from 'date-fns';

// Alturas fixas (ajuste à sua UI se necessário)
const ITEM_HEIGHT = 100;
const HEADER_HEIGHT = 40;

// Hook para data atual injetável
export function useCurrentDate(overrideDate = null) {
  const [forcedDate] = useState(overrideDate);
  return forcedDate ?? new Date();
}

// Mock de agenda; substitua por chamada à API
const agendaMock = [
  { dayIndex: 2, start: '08:00 AM', end: '08:50 AM', title: 'Matemática', room: 'Sala 02', school: 'Prof. Ilza Nascimento Pintus' },
  { dayIndex: 2, start: '08:50 AM', end: '09:40 AM', title: 'Banco de Dados', room: 'Sala 01', school: 'Prof. Ilza Nascimento Pintus' },
  { dayIndex: 2, start: '09:40 AM', end: '10:30 AM', title: 'Banco de Dados', room: 'Sala 01', school: 'EE Prof. Alceu Maynard Araujo' },
  { dayIndex: 2, start: '10:30 AM', end: '11:20 AM', title: 'Programação Web', room: 'Lab 01', school: 'EE Prof. Alceu Maynard Araujo' },
  { dayIndex: 3, start: '10:30 AM', end: '11:20 AM', title: 'Programação Web', room: 'Lab 01', school: 'EE Prof. Alceu Maynard Araujo' },
  { dayIndex: 2, start: '11:20 AM', end: '12:10 PM', title: 'Química', room: 'Sala 03', school: 'Prof. Marcelo Silva' },
  { dayIndex: 2, start: '12:10 PM', end: '01:00 PM', title: 'Física', room: 'Sala 04', school: 'Prof. Ana Oliveira' },
  { dayIndex: 2, start: '01:00 PM', end: '01:50 PM', title: 'Inglês', room: 'Lab de Informática', school: 'Prof. Carla Mendes' },
  { dayIndex: 2, start: '01:50 PM', end: '02:40 PM', title: 'Educação Física', room: 'Quadra', school: 'Prof. Ricardo Santos' },
  { dayIndex: 2, start: '02:40 PM', end: '03:30 PM', title: 'Geografia', room: 'Sala 05', school: 'Prof. Luciana Costa' },
  { dayIndex: 2, start: '03:30 PM', end: '04:20 PM', title: 'História', room: 'Sala 06', school: 'Prof. Fernando Gomes' },
];

const WEEK_DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function formatDate(d) {
  return `${d.getDate().toString().padStart(2,'0')} de ${d.toLocaleString('pt-BR',{ month:'long' })}, ${d.getFullYear()}`;
}

/**
 * Identifica a próxima aula do dia e calcula minutos até seu início.
 */
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

  if (futureLessons.length === 0) return null;

  const nextLesson = futureLessons[0];
  const minutesUntil = differenceInMinutes(nextLesson.startDate, now);

  return { nextLesson, minutesUntil };
}

export default function SemanalScreen({ testDate = null }) {
  const insets = useSafeAreaInsets();
  const currentDate = useCurrentDate(testDate);
  const sectionListRef = useRef(null);

  const [anchor, setAnchor] = useState(() => {
    const hoje = new Date(currentDate);
    hoje.setHours(0,0,0,0);
    return hoje;
  });
  const [selectedIndex, setSelectedIndex] = useState(anchor.getDay());
  const tabBarHeight = 60 + insets.bottom;

  const weekDates = useMemo(() => {
    const dayOfWeek = anchor.getDay();
    const sunday = new Date(anchor);
    sunday.setDate(anchor.getDate() - dayOfWeek);
    sunday.setHours(0,0,0,0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  }, [anchor]);

  useEffect(() => {
    setSelectedIndex(anchor.getDay());
  }, [anchor]);

  // ==> Integração da lógica da próxima aula
  const nextLessonInfo = useMemo(
    () => getNextLessonInfo(agendaMock, selectedIndex, currentDate),
    [agendaMock, selectedIndex, currentDate]
  );

  // Calcula status e minutesUntil
  const hojeSectionData = useMemo(() => {
    const now = currentDate;
    const todayIndex = now.getDay();
    const hojeItems = agendaMock
      .filter(item => item.dayIndex === selectedIndex)
      .map(item => {
        const start = parse(item.start, 'hh:mm a', now);
        const end   = parse(item.end,   'hh:mm a', now);
        const minutesUntil = start > now
          ? differenceInMinutes(start, now)
          : null;

        return {
          ...item,
          isNow: selectedIndex === todayIndex && now >= start && now <= end,
          isPast: now > end,
          minutesUntil,
          startDate: start,
        };
      });

    const grouped = hojeItems.reduce((acc, item) => {
      (acc[item.school] = acc[item.school] || []).push(item);
      return acc;
    }, {});

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [selectedIndex, currentDate]);

  useEffect(() => {
    const sectionIndex = hojeSectionData.findIndex(sec =>
      sec.data.some(it => it.isNow)
    );
    if (sectionIndex >= 0 && sectionListRef.current) {
      const itemIndex = hojeSectionData[sectionIndex].data.findIndex(it => it.isNow);
      sectionListRef.current.scrollToLocation({
        sectionIndex,
        itemIndex,
        viewPosition: 0.5,
        animated: true,
      });
    }
  }, [hojeSectionData]);

  function prevWeek() {
    setAnchor(cur => {
      const n = new Date(cur);
      n.setDate(cur.getDate() - 7);
      n.setHours(0,0,0,0);
      return n;
    });
  }

  function nextWeek() {
    setAnchor(cur => {
      const n = new Date(cur);
      n.setDate(cur.getDate() + 7);
      n.setHours(0,0,0,0);
      return n;
    });
  }

  const headerDate = weekDates[selectedIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header com badge de próxima aula */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevWeek}>
          <Ionicons name="chevron-back-outline" size={24} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{formatDate(headerDate)}</Text>
          {nextLessonInfo ? (
            <Text style={styles.upcomingBadge}>
              Próxima: {nextLessonInfo.nextLesson.title} em{' '}
              {Math.floor(nextLessonInfo.minutesUntil / 60)}h{' '}
              {nextLessonInfo.minutesUntil % 60}m
            </Text>
          ) : (
            <Text style={styles.upcomingBadge}>Sem mais aulas hoje</Text>
          )}
        </View>
        <TouchableOpacity onPress={nextWeek}>
          <Ionicons name="chevron-forward-outline" size={24} />
        </TouchableOpacity>
      </View>

      {/* Seletor de dias */}
      <View style={styles.weekContainer}>
        <FlatList
          data={weekDates}
          keyExtractor={d => d.toISOString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekList}
          renderItem={({ item, index }) => {
            const selected = index === selectedIndex;
            return (
              <TouchableOpacity
                style={[styles.dayBox, selected && styles.dayBoxActive]}
                onPress={() => {
                  setAnchor(new Date(item));
                  setSelectedIndex(index);
                }}
              >
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

      {/* Lista de aulas agrupadas por escola */}
      <SectionList
        ref={sectionListRef}
        sections={hojeSectionData}
        keyExtractor={(item, idx) => `${item.start}-${idx}`}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.viewSchoolTitle}>
            <Text style={styles.schoolTitle}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const borderColor = item.isNow ? '#4CD964' : '#ddd';
          const isNext = nextLessonInfo && item.startDate.getTime() === nextLessonInfo.nextLesson.startDate.getTime();
          return (
            <View
              style={[
                styles.card,
                { borderColor },
                item.isPast && styles.cardPast,
              ]}
            >
              <View style={styles.left}>
                <View style={styles.times}>
                  <Text style={styles.time}>{item.start}</Text>
                  <Text style={styles.time}>{item.end}</Text>
                </View>
                <View
                  style={{
                    width: item.isNow ? 1 : 0.5,
                    height: '80%',
                    backgroundColor: item.isNow ? '#4CD964' : '#222',
                    marginHorizontal: 16,
                  }}
                />
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
                    {Math.floor(item.minutesUntil / 60)}h {item.minutesUntil % 60}m
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
        stickySectionHeadersEnabled={false}
        getItemLayout={(data, flatIndex) => ({
          length: ITEM_HEIGHT,
          offset: flatIndex * ITEM_HEIGHT + HEADER_HEIGHT,
          index: flatIndex,
        })}
        onScrollToLocationFailed={({ sectionIndex, itemIndex }) => {
          setTimeout(() => {
            sectionListRef.current?.scrollToLocation({
              sectionIndex,
              itemIndex,
              viewPosition: 0.5,
              animated: true,
            });
          }, 900);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff', padding: 20 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  headerTitle:     { fontSize: 18, fontWeight: '700' },
  upcomingBadge:   { fontSize: 12, fontWeight: '600', color: '#666', marginTop: 4, color: '#4CD964'},
  weekContainer:   { flexDirection: 'row', justifyContent: 'center', marginBottom: 5 },
  weekList:        { paddingVertical: 12, flex: 1, justifyContent: 'center', alignItems: 'center' },
  dayBox:          { width: 48, height: 80, marginHorizontal: 1, borderRadius: 8, backgroundColor: '#f5f5f7', justifyContent: 'center', alignItems: 'center' },
  dayBoxActive:    { backgroundColor: '#4CD964' },
  dayNum:          { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  dayNumActive:    { color: '#fff' },
  dayName:         { fontSize: 12, color: '#666' },
  dayNameActive:   { color: '#fff' },
  viewSchoolTitle: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  schoolTitle:     { fontSize: 20, fontWeight: '700', marginVertical: 12, width: '50%', textAlign: 'center' },
  card:            { flexDirection: 'row', justifyContent: 'space-between', padding: 16, marginBottom: 12, borderRadius: 8, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, backgroundColor: '#fafafa' },
  left:            { flexDirection: 'row', alignItems: 'center' },
  times:           { marginLeft: 8, marginRight: 12 },
  time:            { fontSize: 14, fontWeight: '600', color: '#333' },
  room:            { fontSize: 12, color: '#555' },
  lesson:          { fontSize: 16, fontWeight: '700' },
  right:           { alignItems: 'flex-end', flex: 1 },
  badgeNow:        { marginTop: 4, fontSize: 12, fontWeight: '600', color: '#4CD964' },
  badgeLater:      { marginTop: 4, fontSize: 12, fontWeight: '600', color: '#666' },
  cardPast:        { opacity: 0.5 },
});