import React, { useEffect, useMemo, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { renkler } from '../constants/renkler';
import { useAraclar } from '../hooks/useAraclar';
import type { Arac } from '../types/Arac';
import { VARSAYILAN_BILDIRIMLER } from '../types/Arac';
import { dateiTarihStringineCevir, tarihStringiniDateYap } from '../utils/tarihHesapla';
import { DatePickerField } from './DatePickerField';

interface AracFormProps {
  mode: 'create' | 'edit';
  aracId?: string;
}

const MAX_YEAR = new Date().getFullYear();

const parseDate = (deger: string | null) => (deger ? tarihStringiniDateYap(deger) : null);

export const AracForm = ({ mode, aracId }: AracFormProps) => {
  const router = useRouter();
  const { aracGetir, araciEkle, araciGuncelle, araciSil, varsayilanBildirimSaati } = useAraclar();
  const mevcutArac = aracId ? aracGetir(aracId) : undefined;

  const [plaka, setPlaka] = useState('');
  const [marka, setMarka] = useState('');
  const [model, setModel] = useState('');
  const [yil, setYil] = useState('');
  const [muayeneTarihi, setMuayeneTarihi] = useState<Date | null>(null);
  const [sigortaTarihi, setSigortaTarihi] = useState<Date | null>(null);
  const [kaskoTarihi, setKaskoTarihi] = useState<Date | null>(null);
  const [bakimTarihi, setBakimTarihi] = useState<Date | null>(null);
  const [gun60, setGun60] = useState(true);
  const [gun30, setGun30] = useState(true);
  const [gun7, setGun7] = useState(true);
  const [gun1, setGun1] = useState(true);
  const [bildirimSaati, setBildirimSaati] = useState<Date | null>(new Date());
  const [kaydediliyor, setKaydediliyor] = useState(false);

  useEffect(() => {
    if (!mevcutArac) {
      return;
    }

    setPlaka(mevcutArac.plaka);
    setMarka(mevcutArac.marka);
    setModel(mevcutArac.model);
    setYil(String(mevcutArac.yil));
    setMuayeneTarihi(parseDate(mevcutArac.muayeneTarihi));
    setSigortaTarihi(parseDate(mevcutArac.sigortaTarihi));
    setKaskoTarihi(parseDate(mevcutArac.kaskoTarihi));
    setBakimTarihi(parseDate(mevcutArac.bakimTarihi));
    setGun60(mevcutArac.bildirimler.gun60);
    setGun30(mevcutArac.bildirimler.gun30);
    setGun7(mevcutArac.bildirimler.gun7);
    setGun1(mevcutArac.bildirimler.gun1);

    const [saat = '09', dakika = '00'] = mevcutArac.bildirimler.saat.split(':');
    const date = new Date();
    date.setHours(Number(saat), Number(dakika), 0, 0);
    setBildirimSaati(date);
  }, [mevcutArac]);

  useEffect(() => {
    if (mode === 'edit' || mevcutArac) {
      return;
    }

    const [saat = '09', dakika = '00'] = varsayilanBildirimSaati.split(':');
    const date = new Date();
    date.setHours(Number(saat), Number(dakika), 0, 0);
    setBildirimSaati(date);
  }, [mevcutArac, mode, varsayilanBildirimSaati]);

  const plakaHatasi = !plaka.trim() ? 'Plaka alani bos birakilamaz' : null;
  const yilDegeri = Number(yil);
  const yilHatasi =
    !/^\d{4}$/.test(yil) || yilDegeri < 1980 || yilDegeri > MAX_YEAR
      ? `Gecerli bir yil girin (1980-${MAX_YEAR})`
      : null;

  const hicTarihYok = !muayeneTarihi && !sigortaTarihi && !kaskoTarihi && !bakimTarihi;
  const formGecerli = !plakaHatasi && !yilHatasi;

  const bildirimSaatString = useMemo(() => {
    const kaynak = bildirimSaati ?? new Date();
    const saat = String(kaynak.getHours()).padStart(2, '0');
    const dakika = String(kaynak.getMinutes()).padStart(2, '0');
    return `${saat}:${dakika}`;
  }, [bildirimSaati]);

  const payloadHazirla = (): Arac => {
    const temelArac = mevcutArac ?? {
      id: '',
      olusturmaTarihi: '',
      guncellemeTarihi: '',
    };

    return {
      ...temelArac,
      plaka: plaka.trim().toUpperCase(),
      marka: marka.trim(),
      model: model.trim(),
      yil: yilDegeri,
      muayeneTarihi: muayeneTarihi ? dateiTarihStringineCevir(muayeneTarihi) : null,
      sigortaTarihi: sigortaTarihi ? dateiTarihStringineCevir(sigortaTarihi) : null,
      kaskoTarihi: kaskoTarihi ? dateiTarihStringineCevir(kaskoTarihi) : null,
      bakimTarihi: bakimTarihi ? dateiTarihStringineCevir(bakimTarihi) : null,
      bildirimler: {
        gun60,
        gun30,
        gun7,
        gun1,
        saat: bildirimSaatString || VARSAYILAN_BILDIRIMLER.saat,
      },
    };
  };

  const handleKaydet = async () => {
    if (!formGecerli) {
      return;
    }

    setKaydediliyor(true);

    try {
      if (mode === 'create') {
        await araciEkle(payloadHazirla());
        router.replace('/(tabs)');
      } else if (mevcutArac) {
        await araciGuncelle(payloadHazirla());
        router.replace(`/arac/${mevcutArac.id}`);
      }
    } finally {
      setKaydediliyor(false);
    }
  };

  const handleSil = () => {
    if (!mevcutArac) {
      return;
    }

    Alert.alert('Araci sil', 'Bu aracin tum tarihlerini ve planlanmis bildirimlerini kaldiracagiz.', [
      {
        text: 'Vazgec',
        style: 'cancel',
      },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await araciSil(mevcutArac.id);
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (mode === 'edit' && !mevcutArac) {
    return (
      <View style={styles.bosEkran}>
        <Stack.Screen options={{ title: 'Arac bulunamadi' }} />
        <Text style={styles.bosBaslik}>Bu arac kaydi bulunamadi.</Text>
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.koyuButon}>
          <Text style={styles.koyuButonMetni}>Ana ekrana don</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: mode === 'create' ? 'Arac ekle' : 'Araci duzenle',
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollIcerik}
        style={styles.ekran}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.heroEtiket}>{mode === 'create' ? 'Yeni kayit' : 'Duzenleme modu'}</Text>
          <Text style={styles.heroBaslik}>Arac takibini tek oturumda hazirla.</Text>
          <Text style={styles.heroAciklama}>
            Kritik tarihleri, bildirim araliklarini ve tercih ettigin hatirlatma saatini buradan
            yonetebilirsin.
          </Text>
        </View>

        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Temel bilgiler</Text>

          <View style={styles.alanGrubu}>
            <Text style={styles.label}>Plaka</Text>
            <TextInput
              autoCapitalize="characters"
              maxLength={9}
              onChangeText={(text) => setPlaka(text)}
              placeholder="34ABC123"
              placeholderTextColor={renkler.metinIkincil}
              style={styles.input}
              value={plaka}
            />
            {plakaHatasi ? <Text style={styles.hata}>{plakaHatasi}</Text> : null}
          </View>

          <View style={styles.ciftKolon}>
            <View style={styles.kolon}>
              <Text style={styles.label}>Marka</Text>
              <TextInput
                onChangeText={setMarka}
                placeholder="Toyota"
                placeholderTextColor={renkler.metinIkincil}
                style={styles.input}
                value={marka}
              />
            </View>

            <View style={styles.kolon}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                onChangeText={setModel}
                placeholder="Corolla"
                placeholderTextColor={renkler.metinIkincil}
                style={styles.input}
                value={model}
              />
            </View>
          </View>

          <View style={styles.alanGrubu}>
            <Text style={styles.label}>Yil</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setYil}
              placeholder={String(MAX_YEAR)}
              placeholderTextColor={renkler.metinIkincil}
              style={styles.input}
              value={yil}
            />
            {yilHatasi ? <Text style={styles.hata}>{yilHatasi}</Text> : null}
          </View>
        </View>

        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Takvim</Text>
          <DatePickerField label="Muayene tarihi" value={muayeneTarihi} onChange={setMuayeneTarihi} />
          <DatePickerField label="Sigorta tarihi" value={sigortaTarihi} onChange={setSigortaTarihi} />
          <DatePickerField label="Kasko tarihi" value={kaskoTarihi} onChange={setKaskoTarihi} />
          <DatePickerField label="Bakim tarihi" value={bakimTarihi} onChange={setBakimTarihi} />

          {hicTarihYok ? (
            <View style={styles.uyariKutusu}>
              <Feather color={renkler.sari} name="alert-circle" size={18} />
              <Text style={styles.uyariMetni}>
                Tarih eklemek zorunlu degil ama hatirlatici degerini acmak icin en az bir tarih
                girmek iyi olur.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.bolum}>
          <Text style={styles.bolumBaslik}>Bildirim tercihleri</Text>

          {(
            [
              ['60 gun kala', gun60, setGun60],
              ['30 gun kala', gun30, setGun30],
              ['7 gun kala', gun7, setGun7],
              ['1 gun kala', gun1, setGun1],
            ] as [string, boolean, (v: boolean) => void][]
          ).map(([etiket, deger, guncelle]) => (
            <View key={etiket} style={styles.switchSatiri}>
              <Text style={styles.switchEtiketi}>{etiket}</Text>
              <Switch
                onValueChange={guncelle}
                thumbColor={renkler.beyaz}
                trackColor={{ false: renkler.arkaPlanKoyu, true: renkler.vurgu }}
                value={deger}
              />
            </View>
          ))}

          <DatePickerField
            label="Bildirim saati"
            mode="time"
            placeholder="09:00"
            value={bildirimSaati}
            onChange={setBildirimSaati}
            clearable={false}
          />
        </View>

        <Pressable
          disabled={!formGecerli || kaydediliyor}
          onPress={handleKaydet}
          style={[styles.koyuButon, (!formGecerli || kaydediliyor) && styles.koyuButonPasif]}
        >
          {kaydediliyor ? (
            <ActivityIndicator color={renkler.beyaz} />
          ) : (
            <Text style={styles.koyuButonMetni}>{mode === 'create' ? 'Kaydet' : 'Guncelle'}</Text>
          )}
        </Pressable>

        {mode === 'edit' ? (
          <Pressable onPress={handleSil} style={styles.silButonu}>
            <Text style={styles.silMetni}>Araci sil</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  ekran: {
    flex: 1,
    backgroundColor: renkler.arkaPlan,
  },
  scrollIcerik: {
    padding: 20,
    gap: 18,
  },
  hero: {
    backgroundColor: renkler.arkaPlanKoyu,
    borderRadius: 30,
    padding: 22,
    gap: 10,
  },
  heroEtiket: {
    color: '#C7D7EA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroBaslik: {
    color: renkler.beyaz,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  heroAciklama: {
    color: '#D7E3F2',
    fontSize: 14,
    lineHeight: 21,
  },
  bolum: {
    backgroundColor: renkler.kart,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    padding: 20,
    gap: 16,
  },
  bolumBaslik: {
    color: renkler.metin,
    fontSize: 18,
    fontWeight: '700',
  },
  alanGrubu: {
    gap: 8,
  },
  ciftKolon: {
    flexDirection: 'row',
    gap: 12,
  },
  kolon: {
    flex: 1,
    gap: 8,
  },
  label: {
    color: renkler.metin,
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    backgroundColor: renkler.arkaPlanKoyu,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: renkler.metin,
    fontSize: 15,
  },
  hata: {
    color: renkler.kirmizi,
    fontSize: 13,
    fontWeight: '600',
  },
  uyariKutusu: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)', // sari but transparent
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  uyariMetni: {
    flex: 1,
    color: renkler.metin,
    fontSize: 13,
    lineHeight: 19,
  },
  switchSatiri: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  switchEtiketi: {
    color: renkler.metin,
    fontSize: 15,
    fontWeight: '600',
  },
  koyuButon: {
    backgroundColor: renkler.vurgu,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  koyuButonPasif: {
    opacity: 0.55,
  },
  koyuButonMetni: {
    color: renkler.beyaz,
    fontSize: 16,
    fontWeight: '700',
  },
  silButonu: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  silMetni: {
    color: renkler.kirmizi,
    fontSize: 15,
    fontWeight: '700',
  },
  bosEkran: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
    backgroundColor: renkler.arkaPlan,
  },
  bosBaslik: {
    color: renkler.metin,
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
});
