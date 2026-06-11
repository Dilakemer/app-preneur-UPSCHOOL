import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { renkler } from '../constants/renkler';
import { useAraclar } from '../hooks/useAraclar';
import { internetBaglantisiVarMi, sigortaTeklifURLiOlustur } from '../services/sigortaService';

export default function SigortaTeklifiScreen() {
  const router = useRouter();
  const { aracId } = useLocalSearchParams<{ aracId?: string }>();
  const { aracGetir } = useAraclar();
  const arac = aracId ? aracGetir(aracId) : undefined;
  const [kontrolEdiliyor, setKontrolEdiliyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  const teklifUrl = useMemo(() => (arac ? sigortaTeklifURLiOlustur(arac) : 'https://www.sigortam.net/'), [arac]);

  useEffect(() => {
    let aktif = true;

    const kontrolEt = async () => {
      const baglantiVar = await internetBaglantisiVarMi();

      if (!aktif) return;

      if (!baglantiVar) {
        Alert.alert('Internet baglantisi gerekli', 'Sigorta teklif sayfasini acmak icin internet baglantisi gerekiyor.', [
          { text: 'Tamam', onPress: () => router.back() },
        ]);
      }

      setKontrolEdiliyor(false);
    };

    kontrolEt();

    return () => {
      aktif = false;
    };
  }, [router]);

  if (kontrolEdiliyor) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={renkler.vurgu} size="large" />
        <Text style={styles.loadingText}>Teklif sayfasi hazirlaniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={renkler.metin} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.title}>Sigorta Teklifi</Text>
          <Text style={styles.desc} numberOfLines={1}>
            {arac ? `${arac.plaka} - ${arac.marka} ${arac.model}` : 'Genel teklif sayfasi'}
          </Text>
        </View>
      </View>

      {hata ? <Text style={styles.errorText}>{hata}</Text> : null}

      <WebView
        source={{ uri: teklifUrl }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.webLoading}>
            <ActivityIndicator color={renkler.vurgu} size="large" />
          </View>
        )}
        onError={() => setHata('Teklif sayfasi yuklenirken bir sorun olustu.')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: renkler.arkaPlan,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: renkler.arkaPlan,
    padding: 24,
  },
  loadingText: { color: renkler.metinIkincil, fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 52,
    backgroundColor: renkler.arkaPlanKoyu,
    borderBottomWidth: 1,
    borderBottomColor: renkler.cizgi,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: renkler.kart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  title: { fontSize: 18, color: renkler.metin, fontWeight: '800' },
  desc: { color: renkler.metinIkincil, lineHeight: 20, marginTop: 2 },
  errorText: {
    color: renkler.hata,
    fontSize: 14,
    fontWeight: '700',
    padding: 12,
    textAlign: 'center',
  },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: renkler.arkaPlan,
  },
});
