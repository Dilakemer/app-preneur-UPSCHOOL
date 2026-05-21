import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { renkler } from '../../constants/renkler';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: renkler.vurgu,
        tabBarInactiveTintColor: renkler.metinIkincil,
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: renkler.arkaPlanKoyu,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        headerStyle: {
          backgroundColor: renkler.arkaPlanKoyu,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          color: renkler.metin,
          fontWeight: '800',
          fontSize: 22,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Araçlarım',
          tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ color, size }) => <Feather name="settings" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
