import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking,
} from 'react-native';
import { renkler } from '../../constants/renkler';
import { useAraclar } from '../../hooks/useAraclar';

const emailGecerliMi = (deger: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deger.trim());

export default function ProfilScreen() {
  const { araclar } = useAraclar();
  const router = useRouter();
  const [isim, setIsim] = useState('Misafir Kullanici');
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [yeniIsim, setYeniIsim] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mod, setMod] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [kayitIsim, setKayitIsim] = useState('');
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    const yukle = async () => {
      const [status, kayitliIsim, kayitliEposta] = await Promise.all([
        AsyncStorage.getItem('@caremind:isLoggedIn'),
        AsyncStorage.getItem('@caremind:kullaniciAdi'),
        AsyncStorage.getItem('@caremind:kayitliEposta'),
      ]);

      if (kayitliEposta) setEmail(kayitliEposta);
      if (kayitliIsim) {
        setIsim(kayitliIsim);
        setYeniIsim(kayitliIsim);
      } else {
        setYeniIsim('Kullanici');
      }
      setIsLoggedIn(status === 'true');
    };

    yukle().catch(() => setHata('Profil bilgileri yuklenemedi.'));
  }, []);

  const aracSayisi = araclar.length;
  const careScore = useMemo(() => (aracSayisi > 0 ? Math.min(100, 70 + aracSayisi * 10) : 0), [aracSayisi]);

  const girisYap = async () => {
    setHata(null);
    const temizEmail = email.trim().toLowerCase();

    if (!emailGecerliMi(temizEmail)) {
      setHata('Gecerli bir e-posta adresi girin.');
      return;
    }

    const kayitliEposta = await AsyncStorage.getItem('@caremind:kayitliEposta');

    if (!kayitliEposta) {
      setHata('Kayitli profil bulunamadi. Once kayit olun.');
      setMod('register');
      return;
    }

    if (temizEmail !== kayitliEposta.toLowerCase()) {
      setHata('Bu e-posta ile kayitli profil bulunamadi.');
      return;
    }

    const kayitliIsim = await AsyncStorage.getItem('@caremind:kullaniciAdi');
    setIsim(kayitliIsim || 'Premium Uye');
    setYeniIsim(kayitliIsim || 'Premium Uye');
    await AsyncStorage.setItem('@caremind:isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const kayitOl = async () => {
    setHata(null);
    const temizEmail = email.trim().toLowerCase();
    const temizIsim = kayitIsim.trim();

    if (!temizIsim || !emailGecerliMi(temizEmail)) {
      setHata('Ad soyad ve gecerli e-posta adresi gerekli.');
      return;
    }

    if (temizEmail.length > 254) {
      setHata('E-posta adresi cok uzun.');
      return;
    }

    await AsyncStorage.setItem('@caremind:kayitliEposta', temizEmail);
    await AsyncStorage.setItem('@caremind:kullaniciAdi', temizIsim);
    await AsyncStorage.setItem('@caremind:isLoggedIn', 'true');

    setIsim(temizIsim);
    setYeniIsim(temizIsim);
    setIsLoggedIn(true);
  };

  const cikisYap = async () => {
    await AsyncStorage.removeItem('@caremind:isLoggedIn');
    setIsLoggedIn(false);
    setKayitIsim('');
    setMod('login');
  };

  const isimKaydet = async () => {
    const temizIsim = yeniIsim.trim();
    if (temizIsim.length > 0) {
      await AsyncStorage.setItem('@caremind:kullaniciAdi', temizIsim);
      setIsim(temizIsim);
    }
    setDuzenlemeModu(false);
  };

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.loginScrollContainer}>
          <View style={styles.loginContainer}>
            <View style={styles.loginHeader}>
              <View style={styles.loginIconWrap}>
                <Feather name="shield" size={46} color={renkler.vurgu} />
              </View>
              <Text style={styles.loginTitle}>
                {mod === 'login' ? "CareMind'e Giris" : "CareMind'e Kayit"}
              </Text>
              <Text style={styles.loginDesc}>
                Profiliniz araclarinizi ayirmak, offline veriyi dogru hesapla eslemek ve sonraki
                senkronizasyon adimi icin kullanilir.
              </Text>
            </View>

            {mod === 'register' ? (
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color={renkler.metinIkincil} style={styles.inputIcon} />
                <TextInput
                  style={styles.loginInput}
                  placeholder="Ad Soyad"
                  placeholderTextColor={renkler.metinIkincil}
                  value={kayitIsim}
                  onChangeText={setKayitIsim}
                />
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={renkler.metinIkincil} style={styles.inputIcon} />
              <TextInput
                style={styles.loginInput}
                placeholder="E-posta"
                placeholderTextColor={renkler.metinIkincil}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {hata ? <Text style={styles.errorText}>{hata}</Text> : null}

            <Pressable style={styles.loginButton} onPress={mod === 'login' ? girisYap : kayitOl}>
              <Text style={styles.loginButtonText}>{mod === 'login' ? 'Giris Yap' : 'Kayit Ol'}</Text>
            </Pressable>

            <Pressable
              style={styles.modSwitchButton}
              onPress={() => {
                setHata(null);
                setMod(mod === 'login' ? 'register' : 'login');
              }}
            >
              <Text style={styles.modSwitchText}>
                {mod === 'login' ? 'Hesabiniz yok mu? Kayit olun' : 'Zaten hesabiniz var mi? Giris yapin'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{isim.charAt(0).toUpperCase()}</Text>
            <View style={styles.badge}>
              <Feather name="star" size={12} color="#FFF" />
            </View>
          </View>

          {duzenlemeModu ? (
            <View style={styles.isimEditContainer}>
              <TextInput
                style={styles.isimInput}
                value={yeniIsim}
                onChangeText={setYeniIsim}
                autoFocus
                placeholderTextColor={renkler.metinIkincil}
              />
              <Pressable style={styles.kaydetButon} onPress={isimKaydet}>
                <Feather name="check" size={20} color="#FFF" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.isimContainer}>
              <Text style={styles.isimText}>{isim}</Text>
              <Pressable onPress={() => setDuzenlemeModu(true)} style={styles.editIcon}>
                <Feather name="edit-3" size={18} color={renkler.vurgu} />
              </Pressable>
            </View>
          )}
          <Text style={styles.uyeTipi}>Premium Uye</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Feather name="grid" size={24} color={renkler.vurgu} style={styles.statIcon} />
            <Text style={styles.statDeger}>{aracSayisi}</Text>
            <Text style={styles.statEtiket}>Kayitli Arac</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Feather name="award" size={24} color={renkler.sari} style={styles.statIcon} />
            <Text style={styles.statDeger}>{careScore}</Text>
            <Text style={styles.statEtiket}>Care Puani</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basarimlar</Text>
          <Achievement icon="shield" color={renkler.yesil} title="Guvenli Surucu" desc="Takip edilen tarihlerin tek panelde." />
          <Achievement icon="cpu" color={renkler.vurgu} title="AI Hazir" desc="Arac detayindan danisman tavsiyesi alabilirsin." />
        </View>

        <Pressable style={styles.compareButton} onPress={() => {
          const firstAracId = araclar.length > 0 ? araclar[0].id : undefined;
          router.push(`/sigorta-karsilastir?aracId=${firstAracId ?? ''}`);
        }}>
          <Feather name="bar-chart-2" size={18} color={renkler.beyaz} />
          <Text style={styles.compareButtonText}>Sigorta Fiyatlarini Karsilastir</Text>
        </Pressable>

        <Pressable style={styles.supportButton} onPress={() => Linking.openURL('mailto:support@caremind.app?subject=CareMind%20Destek')}>
          <Feather name="help-circle" size={18} color={renkler.metin} />
          <Text style={styles.supportButtonText}>Destek Al</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={cikisYap}>
          <Feather name="log-out" size={20} color={renkler.hata} />
          <Text style={styles.logoutText}>Cikis Yap</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Achievement({
  icon,
  color,
  title,
  desc,
}: {
  icon: keyof typeof Feather.glyphMap;
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.achievementCard}>
      <View style={[styles.achievementIcon, { backgroundColor: `${color}24` }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: renkler.arkaPlan },
  container: { flex: 1, backgroundColor: renkler.arkaPlan, padding: 20 },
  header: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: renkler.kartKoyu,
    borderWidth: 3,
    borderColor: renkler.vurgu,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: renkler.vurgu,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarText: { fontSize: 40, fontWeight: '800', color: renkler.beyaz },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: renkler.sari,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: renkler.arkaPlan,
  },
  isimContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  isimText: { fontSize: 26, fontWeight: '800', color: renkler.metin },
  editIcon: { marginLeft: 10, padding: 4 },
  isimEditContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  isimInput: {
    backgroundColor: renkler.kart,
    color: renkler.metin,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    minWidth: 200,
    textAlign: 'center',
  },
  kaydetButon: { backgroundColor: renkler.vurgu, padding: 10, borderRadius: 12, marginLeft: 8 },
  uyeTipi: { fontSize: 14, color: renkler.vurgu, fontWeight: '700' },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: renkler.kart,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    marginBottom: 30,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 8 },
  statDeger: { fontSize: 28, fontWeight: '800', color: renkler.metin },
  statEtiket: { fontSize: 13, color: renkler.metinIkincil, marginTop: 4, fontWeight: '500' },
  statDivider: { width: 1, backgroundColor: renkler.cizgi, marginHorizontal: 10 },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: renkler.metin, marginBottom: 16 },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: renkler.kart,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '700', color: renkler.metin, marginBottom: 4 },
  achievementDesc: { fontSize: 13, color: renkler.metinIkincil, lineHeight: 18 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    gap: 8,
  },
  logoutText: { color: renkler.hata, fontSize: 16, fontWeight: '700' },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 12,
    backgroundColor: renkler.vurgu,
    borderRadius: 16,
    gap: 10,
  },
  compareButtonText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 12,
    backgroundColor: renkler.kart,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: renkler.cizgi,
  },
  supportButtonText: { color: renkler.metin, fontSize: 15, fontWeight: '700', marginLeft: 8 },
  loginScrollContainer: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  loginContainer: { padding: 24, justifyContent: 'center' },
  loginHeader: { alignItems: 'center', marginBottom: 36 },
  loginIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginTitle: { fontSize: 28, fontWeight: '800', color: renkler.metin, marginBottom: 12, textAlign: 'center' },
  loginDesc: {
    fontSize: 15,
    color: renkler.metinIkincil,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: renkler.kart,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  loginInput: { flex: 1, height: 56, fontSize: 16, color: renkler.metin },
  errorText: { color: renkler.hata, fontSize: 14, fontWeight: '700', marginBottom: 4 },
  loginButton: {
    backgroundColor: renkler.vurgu,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  loginButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  modSwitchButton: { marginTop: 24, padding: 8, alignItems: 'center' },
  modSwitchText: { color: renkler.vurgu, fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
