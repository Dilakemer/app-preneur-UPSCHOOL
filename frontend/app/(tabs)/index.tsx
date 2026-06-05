import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AracKarti } from '../../components/AracKarti';
import { EmptyState } from '../../components/EmptyState';
import { renkler } from '../../constants/renkler';
import { useAraclar } from '../../hooks/useAraclar';

export default function AnaEkran() {
  const router = useRouter();
  const { araclar, yukleniyor, yenileniyor, yenile, bildirimKotaMesaji } = useAraclar();
  const [refreshing, setRefreshing] = useState(false);

  const toplamTarih = useMemo(
    () =>
      araclar.reduce(
        (adet, arac) =>
          adet +
          [arac.muayeneTarihi, arac.sigortaTarihi, arac.kaskoTarihi, arac.bakimTarihi].filter(Boolean)
            .length,
        0,
      ),
    [araclar],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await yenile();
    } finally {
      setRefreshing(false);
    }
  }, [yenile]);

  if (yukleniyor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Yukleniyor...</Text>
      </SafeAreaView>
    );
  }

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
          ListHeaderComponent={
            <View style={styles.summary}>
              <View>
                <Text style={styles.summaryLabel}>Aktif takip</Text>
                <Text style={styles.summaryTitle}>{araclar.length} arac</Text>
              </View>
              <View style={styles.summaryMetric}>
                <Text style={styles.summaryMetricValue}>{toplamTarih}</Text>
                <Text style={styles.summaryMetricLabel}>tarih</Text>
              </View>
              {bildirimKotaMesaji ? <Text style={styles.warningText}>{bildirimKotaMesaji}</Text> : null}
            </View>
          }
          renderItem={({ item }) => (
            <AracKarti arac={item} onPress={() => router.push(`/arac/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || yenileniyor}
              onRefresh={handleRefresh}
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
  loadingText: { padding: 20, color: renkler.metinIkincil },
  listContent: { paddingVertical: 12, paddingBottom: 100, gap: 16 },
  emptyWrap: { padding: 16, marginTop: 40 },
  summary: {
    alignItems: 'center',
    backgroundColor: renkler.kart,
    borderColor: renkler.cizgi,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  summaryLabel: {
    color: renkler.metinIkincil,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryTitle: {
    color: renkler.metin,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryMetric: {
    alignItems: 'flex-end',
  },
  summaryMetricValue: {
    color: renkler.vurgu,
    fontSize: 28,
    fontWeight: '800',
  },
  summaryMetricLabel: {
    color: renkler.metinIkincil,
    fontSize: 12,
    fontWeight: '700',
  },
  warningText: {
    color: renkler.sari,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -18,
  },
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
