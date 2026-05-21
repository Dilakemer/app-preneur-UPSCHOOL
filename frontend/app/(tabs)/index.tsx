import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAraclar } from '../../hooks/useAraclar';
import { AracKarti } from '../../components/AracKarti';
import { EmptyState } from '../../components/EmptyState';
import { renkler } from '../../constants/renkler';
import { Feather } from '@expo/vector-icons';

export default function AnaEkran() {
  const router = useRouter();
  const { araclar, yukleniyor } = useAraclar();
  const [refreshing, setRefreshing] = useState(false);

  if (yukleniyor) return <Text style={{ padding: 20, color: renkler.metinIkincil }}>Yükleniyor...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      {araclar.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState onAdd={() => router.push('/arac/ekle')} />
        </View>
      ) : (
        <FlatList
          data={araclar}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AracKarti arac={item} onPress={() => router.push(`/arac/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); }} 
              tintColor={renkler.vurgu}
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/arac/ekle')} activeOpacity={0.8}>
        <Feather name="plus" size={28} color={renkler.beyaz} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10, backgroundColor: renkler.arkaPlan },
  listContent: { paddingVertical: 12, paddingBottom: 100 },
  emptyWrap: { padding: 16, marginTop: 40 },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: renkler.vurgu,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: renkler.vurgu,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
