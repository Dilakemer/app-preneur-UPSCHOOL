import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { renkler } from '../constants/renkler';
import { useAraclar } from '../hooks/useAraclar';
import { sigortaTeklifleriniGetir, type Teklif } from '../services/sigortaService';

const paraFormatla = (value: number) => `${Math.round(value).toLocaleString('tr-TR')} TL`;

const tarihSaatFormatla = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Az once';

  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
};

export default function SigortaKarsilastir() {
  const router = useRouter();
  const { aracId } = useLocalSearchParams<{ aracId?: string }>();
  const { aracGetir, araclar } = useAraclar();
  const arac = aracId ? aracGetir(aracId) : araclar.length > 0 ? araclar[0] : undefined;
  const [teklifler, setTeklifler] = useState<Teklif[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [acilanTeklifId, setAcilanTeklifId] = useState<string | null>(null);

  const kaynak = teklifler.some((teklif) => teklif.source === 'backend') ? 'backend' : 'estimate';
  const enDusukTeklif = teklifler[0];

  const altBaslik = useMemo(() => {
    if (arac) return `${arac.plaka} - ${arac.marka} ${arac.model} (${arac.yil})`;
    return 'Arac eklemeden genel trafik sigortasi tahmini';
  }, [arac]);

  const teklifleriYukle = useCallback(async () => {
    setYukleniyor(true);

    try {
      const sonuc = await sigortaTeklifleriniGetir(arac);
      setTeklifler(sonuc);
    } catch {
      Alert.alert('Teklifler hazirlanamadi', 'Lutfen internet baglantinizi kontrol edip tekrar deneyin.');
    } finally {
      setYukleniyor(false);
    }
  }, [arac]);

  useEffect(() => {
    teklifleriYukle();
  }, [teklifleriYukle]);

  const openOffer = async (teklif: Teklif) => {
    if (!teklif.redirectUrl) {
      Alert.alert('Baglanti hazir degil', 'Bu sigorta sirketi icin teklif baglantisi bulunamadi.');
      return;
    }

    setAcilanTeklifId(teklif.id);

    try {
      const destekleniyor = await Linking.canOpenURL(teklif.redirectUrl);
      if (!destekleniyor) throw new Error('URL desteklenmiyor');
      await Linking.openURL(teklif.redirectUrl);
    } catch {
      Alert.alert('Sayfa acilamadi', 'Teklif sayfasina yonlendirme yapilamadi. Biraz sonra tekrar deneyin.');
    } finally {
      setAcilanTeklifId(null);
    }
  };

  const renderTeklif = ({ item, index }: { item: Teklif; index: number }) => (
    <Pressable style={styles.card} onPress={() => openOffer(item)} accessibilityRole="button">
      <View style={styles.cardTop}>
        <View style={styles.rank}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.providerInfo}>
          <View style={styles.providerLine}>
            <Text style={styles.name}>{item.name}</Text>
            {item.badge ? <Text style={styles.badge}>{item.badge}</Text> : null}
          </View>
          <Text style={styles.meta}>
            {item.coverageType === 'trafik' ? 'Zorunlu trafik sigortasi' : 'Sigorta'} -{' '}
            {item.rating ? `${item.rating.toFixed(1)} hizmet puani` : 'Hizmet puani yok'}
          </Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.price}>{paraFormatla(item.price)}</Text>
          <Text style={styles.range}>
            Aralik: {paraFormatla(item.minPrice)} - {paraFormatla(item.maxPrice)}
          </Text>
        </View>
        <View style={styles.cta}>
          {acilanTeklifId === item.id ? (
            <ActivityIndicator size="small" color={renkler.beyaz} />
          ) : (
            <Feather name="external-link" size={17} color={renkler.beyaz} />
          )}
          <Text style={styles.ctaText}>Teklif al</Text>
        </View>
      </View>

      <View style={styles.highlights}>
        {item.highlights.slice(0, 2).map((highlight) => (
          <View key={highlight} style={styles.highlightItem}>
            <Feather name="check" size={13} color={renkler.yesil} />
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={renkler.metin} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Sigorta teklifleri</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {altBaslik}
          </Text>
        </View>
      </View>

      {yukleniyor ? (
        <View style={styles.loading}>
          <ActivityIndicator color={renkler.vurgu} size="large" />
          <Text style={styles.loadingText}>Teklifler hazirlaniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={teklifler}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={yukleniyor}
          onRefresh={teklifleriYukle}
          ListHeaderComponent={
            <View style={styles.summary}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryLabel}>En iyi baslangic</Text>
                  <Text style={styles.summaryPrice}>{enDusukTeklif ? paraFormatla(enDusukTeklif.price) : '-'}</Text>
                </View>
                <View style={[styles.sourcePill, kaynak === 'backend' ? styles.sourceLive : styles.sourceEstimate]}>
                  <Feather name={kaynak === 'backend' ? 'wifi' : 'bar-chart-2'} size={14} color={renkler.beyaz} />
                  <Text style={styles.sourceText}>{kaynak === 'backend' ? 'Canli' : 'Tahmini'}</Text>
                </View>
              </View>

              <Text style={styles.summaryNote}>
                Fiyatlar plaka, arac yasi, yenileme durumu ve sigorta sirketi kampanyalarina gore degisebilir.
                Kesin police bedeli ilgili teklif sayfasinda hesaplanir.
              </Text>

              <Text style={styles.updatedText}>
                Son kontrol: {enDusukTeklif ? tarihSaatFormatla(enDusukTeklif.lastUpdated) : 'Az once'}
              </Text>
            </View>
          }
          renderItem={renderTeklif}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Teklif bulunamadi</Text>
              <Text style={styles.emptyText}>Biraz sonra tekrar deneyebilir veya arac bilgilerini kontrol edebilirsin.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: renkler.arkaPlan },
  header: {
    alignItems: 'center',
    backgroundColor: renkler.arkaPlanKoyu,
    borderBottomColor: renkler.cizgi,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 52,
  },
  back: {
    alignItems: 'center',
    backgroundColor: renkler.kart,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerText: { flex: 1 },
  title: { color: renkler.metin, fontSize: 20, fontWeight: '800' },
  sub: { color: renkler.metinIkincil, marginTop: 4 },
  loading: { alignItems: 'center', flex: 1, gap: 12, justifyContent: 'center', padding: 24 },
  loadingText: { color: renkler.metinIkincil, fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 32 },
  summary: {
    backgroundColor: renkler.kart,
    borderColor: renkler.cizgi,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  summaryTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: renkler.metinIkincil, fontSize: 12, fontWeight: '700' },
  summaryPrice: { color: renkler.metin, fontSize: 28, fontWeight: '900', marginTop: 4 },
  sourcePill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sourceLive: { backgroundColor: renkler.yesil },
  sourceEstimate: { backgroundColor: renkler.sari },
  sourceText: { color: renkler.beyaz, fontSize: 12, fontWeight: '800' },
  summaryNote: { color: renkler.metinIkincil, lineHeight: 20, marginTop: 14 },
  updatedText: { color: renkler.metinIkincil, fontSize: 12, fontWeight: '700', marginTop: 10 },
  separator: { height: 12 },
  card: {
    backgroundColor: renkler.kart,
    borderColor: renkler.cizgi,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardTop: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  rank: {
    alignItems: 'center',
    backgroundColor: renkler.vurguSoluk,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  rankText: { color: renkler.vurgu, fontSize: 13, fontWeight: '900' },
  providerInfo: { flex: 1 },
  providerLine: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  name: { color: renkler.metin, fontSize: 16, fontWeight: '800' },
  badge: {
    backgroundColor: renkler.kartKoyu,
    borderColor: renkler.cizgi,
    borderRadius: 999,
    borderWidth: 1,
    color: renkler.metinIkincil,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  meta: { color: renkler.metinIkincil, fontSize: 12, marginTop: 5 },
  priceRow: {
    alignItems: 'center',
    borderTopColor: renkler.cizgi,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
  },
  price: { color: renkler.vurgu, fontSize: 22, fontWeight: '900' },
  range: { color: renkler.metinIkincil, fontSize: 12, marginTop: 4 },
  cta: {
    alignItems: 'center',
    backgroundColor: renkler.vurgu,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  ctaText: { color: renkler.beyaz, fontWeight: '800' },
  highlights: { gap: 8, marginTop: 14 },
  highlightItem: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  highlightText: { color: renkler.metinIkincil, flex: 1, fontSize: 13 },
  empty: { alignItems: 'center', padding: 24 },
  emptyTitle: { color: renkler.metin, fontSize: 17, fontWeight: '800' },
  emptyText: { color: renkler.metinIkincil, lineHeight: 20, marginTop: 8, textAlign: 'center' },
});
