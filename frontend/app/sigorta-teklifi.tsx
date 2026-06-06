import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { renkler } from '../constants/renkler';
import { useAraclar } from '../hooks/useAraclar';
import { sigortaTeklifURLiOlustur } from '../services/sigortaService';

export default function SigortaTeklifiScreen() {
  const router = useRouter();
  const { aracId } = useLocalSearchParams<{ aracId?: string }>();
  const { aracGetir } = useAraclar();
  const arac = aracId ? aracGetir(aracId) : undefined;
  const [aciliyor, setAciliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const teklifUrl = useMemo(() => (arac ? sigortaTeklifURLiOlustur(arac) : 'https://www.sigortam.net/'), [arac]);

  const open = async () => {
    setHata(null);
    setAciliyor(true);

    try {
      await Linking.openURL(teklifUrl);
    } catch {
      setHata('Teklif sayfasi acilirken bir sorun olustu.');
    } finally {
      setAciliyor(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={22} color={renkler.metin} />
      </Pressable>

      <View style={styles.iconWrap}>
        <Feather name="shield" size={44} color={renkler.vurgu} />
      </View>
      <Text style={styles.title}>Sigorta Teklifi</Text>
      <Text style={styles.desc}>
        {arac
          ? `${arac.plaka} plakali ${arac.marka} ${arac.model} icin teklif sayfasina yonlendirileceksiniz.`
          : 'Arac secilmedigi icin genel teklif sayfasina yonlendirileceksiniz.'}
      </Text>

      {hata ? <Text style={styles.errorText}>{hata}</Text> : null}

      <Pressable style={[styles.button, aciliyor && styles.buttonDisabled]} onPress={open} disabled={aciliyor}>
        {aciliyor ? (
          <ActivityIndicator color={renkler.beyaz} />
        ) : (
          <>
            <Feather name="external-link" size={18} color={renkler.beyaz} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Teklif Al</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: renkler.arkaPlan,
  },
  backButton: {
    position: 'absolute',
    top: 54,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: renkler.kart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: renkler.vurguSoluk,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  title: { fontSize: 26, color: renkler.metin, marginBottom: 10, fontWeight: '800' },
  desc: { marginBottom: 22, textAlign: 'center', color: renkler.metinIkincil, lineHeight: 22 },
  errorText: {
    color: renkler.hata,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: renkler.vurgu,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: renkler.beyaz, fontWeight: '700', fontSize: 16 },
});
