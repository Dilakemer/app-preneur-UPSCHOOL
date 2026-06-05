import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { renkler } from '../constants/renkler';
import { useAraclar } from '../hooks/useAraclar';
import { sigortaTeklifURLiOlustur } from '../services/sigortaService';

type Insurer = { id: string; name: string; base: number; rating: number };

const INSURERS: Insurer[] = [
  { id: 'allianz', name: 'Allianz', base: 1800, rating: 4.6 },
  { id: 'aksigorta', name: 'Aksigorta', base: 1750, rating: 4.3 },
  { id: 'anadolu', name: 'Anadolu Sigorta', base: 1900, rating: 4.5 },
  { id: 'groupama', name: 'Groupama', base: 1700, rating: 4.1 },
  { id: 'mapfre', name: 'Mapfre', base: 1650, rating: 4.0 },
];

export default function SigortaKarsilastir() {
  const router = useRouter();
  const { aracId } = useLocalSearchParams<{ aracId?: string }>();
  const { aracGetir, araclar } = useAraclar();
  const arac = aracId ? aracGetir(aracId) : araclar.length > 0 ? araclar[0] : undefined;
  const [aciliyor, setAciliyor] = useState(false);

  const teklifler = useMemo(() => {
    const ageFactor = arac ? Math.max(0.7, 1 - (new Date().getFullYear() - arac.yil) * 0.03) : 0.9;
    return INSURERS.map((s) => ({
      ...s,
      price: Math.round(s.base * ageFactor * (1 + (100 - (arac ? Math.min(100, arac.yil % 100) : 50)) / 1000)),
    }));
  }, [arac]);

  const openOffer = async (insurerId: string, insurer?: Insurer) => {
    setAciliyor(true);
    try {
      const url = arac ? `${sigortaTeklifURLiOlustur(arac)}&insurer=${insurerId}` : 'https://www.sigortam.net/';
      await Linking.openURL(url);
    } catch (e) {
      router.replace('/');
    } finally {
      setAciliyor(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color={renkler.metin} />
      </Pressable>

      <Text style={styles.title}>Sigorta Fiyatlari - Karsilastir</Text>
      <Text style={styles.sub}>{arac ? `${arac.plaka} • ${arac.marka} ${arac.model}` : 'Arac secilmedi — tum araclara gore tahmini fiyatlar.'}</Text>

      <Text style={{ textAlign: 'center', color: renkler.metinIkincil, marginTop: 8, marginBottom: 8 }}>Bu mod affiliate/tahmini modudur — herhangi bir şirkete ayrı ayrı kayıt olmadan tahmini fiyatları görebilirsiniz. Teklif almak için ilgili sayfaya yönlendirileceksiniz.</Text>

      <FlatList
        data={INSURERS.map((s) => ({
          ...s,
          price: Math.round(s.base * (arac ? Math.max(0.7, 1 - (new Date().getFullYear() - arac.yil) * 0.03) : 0.9)),
        })).sort((a, b) => a.price - b.price)}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => openOffer(item.id, item)}>
            <View style={styles.left}>
              <Text style={styles.name}>{item.name}</Text>
              {typeof item.rating === 'number' ? <Text style={styles.rating}>Puan: {item.rating.toFixed(1)}</Text> : null}
            </View>
            <View style={styles.right}>
              <Text style={styles.price}>{item.price ?? '-'} TL</Text>
              <Text style={styles.btnText}>Teklif Al</Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {aciliyor ? <ActivityIndicator style={{ position: 'absolute', bottom: 30, alignSelf: 'center' }} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: renkler.arkaPlan },
  back: { position: 'absolute', top: 54, left: 18, width: 40, height: 40, borderRadius: 20, backgroundColor: renkler.kart, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  title: { fontSize: 22, fontWeight: '800', color: renkler.metin, textAlign: 'center', marginTop: 60 },
  sub: { color: renkler.metinIkincil, textAlign: 'center', marginTop: 8, marginBottom: 12 },
  card: { flexDirection: 'row', backgroundColor: renkler.kart, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: renkler.cizgi, alignItems: 'center', justifyContent: 'space-between' },
  left: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: renkler.metin },
  rating: { color: renkler.metinIkincil, marginTop: 6 },
  right: { alignItems: 'flex-end' },
  price: { fontSize: 18, fontWeight: '900', color: renkler.vurgu },
  btnText: { marginTop: 6, color: renkler.vurgu, fontWeight: '700' },
});
