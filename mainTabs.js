// MainTabs.js
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import SemanalScreen       from './professor/screens/semanal';
import EscolasScreen       from './professor/screens/escolas';
import GradeScreen         from './professor/screens/grade';
import ConfiguracoesScreen from './professor/screens/configuracoes';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EscolasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EscolasList" component={EscolasScreen} />
      <Stack.Screen
        name="Grade"
        component={GradeScreen}
        options={({ route }) => ({
          headerShown:    true,
          headerTitle:    route.params.escolaNome,
          headerBackTitle: 'Voltar',
        })}
      />
    </Stack.Navigator>
  );
}

export default function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown:      false,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          position:   'absolute',
          left:       0,
          right:      0,
          bottom:     0,
          height:     60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation:  5,
          shadowOpacity: 0.1,
        },
        tabBarIcon: ({ focused, size }) => {
          const icons = {
            Semanal:   focused ? 'calendar'        : 'calendar-outline',
            Escolas:   focused ? 'school'          : 'school-outline',
            Configs:   focused ? 'settings'        : 'settings-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} />;
        }
      })}
    >
      <Tab.Screen name="Semanal" options={{ tabBarLabel: 'Semanal' }}>
        {props => (
          <SemanalScreen
            {...props}
            // Aqui você força a data para testes:
            testDate={new Date('2025-06-18T13:10:00')}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Escolas" component={EscolasStack}   options={{ tabBarLabel: 'Escolas' }} />
      <Tab.Screen name="Configs" component={ConfiguracoesScreen} options={{ tabBarLabel: 'Configurações' }} />
    </Tab.Navigator>
  );
}
