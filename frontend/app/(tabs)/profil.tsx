import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renkler } from '../../constants/renkler';
import { useAraclar } from '../../hooks/useAraclar';

export default function ProfilScreen() {
  const { araclar } = useAraclar();
  const [isim, setIsim] = useState('Misafir Kullanıcı');
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [yeniIsim, setYeniIsim] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mod, setMod] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [kayitIsim, setKayitIsim] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('@caremind:isLoggedIn').then((status) => {
      if (status === 'true') {
        setIsLoggedIn(true);
      }
    });

    AsyncStorage.getItem('@caremind:kullaniciAdi').then((kayitliIsim) => {
      if (kayitliIsim) {
        setIsim(kayitliIsim);
        setYeniIsim(kayitliIsim);
      } else {
        setYeniIsim('Kullanıcı');
      }
    });
  }, []);

  const girisYap = async () => {
    if (!email) {
      alert('Lütfen e-posta ve şifrenizi girin.');
      return;
    }

    const kayitliEposta = await AsyncStorage.getItem('@caremind:kayitliEposta');

    if (!kayitliEposta) {
      alert('Kayıtlı hesap bulunamadı! Lütfen önce "Kayıt Ol" seçeneğiyle hesap oluşturun.');
      return;
    }

    if (email.trim().toLowerCase() !== kayitliEposta.toLowerCase()) {
      alert('Hatalı e-posta veya şifre!');
      return;
    }

    const kayitliIsim = await AsyncStorage.getItem('@caremind:kullaniciAdi');
    setIsim(kayitliIsim || 'Premium Üye');
    
    await AsyncStorage.setItem('@caremind:isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const kayitOl = async () => {
    if (!kayitIsim.trim() || !email) {
      alert('Lütfen tüm alanları doldurun.');
      return;
    }

    if (email.trim().indexOf('@') === -1) {
      alert('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    if (email.trim().length > 254) {
      alert('E-posta adresi cok uzun.');
      return;
    }

    await AsyncStorage.setItem('@caremind:kayitliEposta', email.trim().toLowerCase());
    await AsyncStorage.removeItem('@caremind:kayitliSifre');
    await AsyncStorage.setItem('@caremind:kullaniciAdi', kayitIsim.trim());
    
    setIsim(kayitIsim.trim());
    await AsyncStorage.setItem('@caremind:isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const cikisYap = async () => {
    await AsyncStorage.removeItem('@caremind:isLoggedIn');
    setIsLoggedIn(false);
    setEmail('');
    setKayitIsim('');
    setMod('login');
  };

  const isimKaydet = async () => {
    if (yeniIsim.trim().length > 0) {
      await AsyncStorage.setItem('@caremind:kullaniciAdi', yeniIsim.trim());
      setIsim(yeniIsim.trim());
    }
    setDuzenlemeModu(false);
  };

  const aracSayisi = araclar.length;
  // Basit bir gamification mantığı:
  // Başlangıç puanı 100, ancak hiç araç yoksa 0. Araç başına 10 puan, vs.
  const careScore = aracSayisi > 0 ? Math.min(100, 70 + aracSayisi * 10) : 0;

  if (!isLoggedIn) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: renkler.arkaPlan }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.loginScrollContainer}>
          <View style={styles.loginContainer}>
            <View style={styles.loginHeader}>
              <View style={styles.loginIconWrap}>
                <Feather name="shield" size={48} color={renkler.vurgu} />
              </View>
              <Text style={styles.loginTitle}>
                {mod === 'login' ? 'CareMind\'e Giriş Yapın' : 'CareMind\'e Kayıt Olun'}
              </Text>
              <Text style={styles.loginDesc}>
                {mod === 'login' 
                  ? 'Premium özelliklerden faydalanmak ve verilerinizi güvende tutmak için giriş yapın.' 
                  : 'Aracınızın tüm bakım süreçlerini tek bir yerden yönetmek için ücretsiz hesap oluşturun.'}
              </Text>
            </View>

            {mod === 'register' && (
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
            )}

            {false && (
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={renkler.metinIkincil} style={styles.inputIcon} />
              <TextInput 
                style={styles.loginInput} 
                placeholder="E-posta" 
                placeholderTextColor={renkler.metinIkincil} 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={email}
                onChangeText={setEmail}
              />
            </View>
            )}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color={renkler.metinIkincil} style={styles.inputIcon} />
              <TextInput 
                style={styles.loginInput} 
                placeholder="Şifre" 
                placeholderTextColor={renkler.metinIkincil} 
                secureTextEntry 
              />
            </View>

            <Pressable 
              style={styles.loginButton} 
              onPress={mod === 'login' ? girisYap : kayitOl}
            >
              <Text style={styles.loginButtonText}>
                {mod === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </Text>
            </Pressable>

            <Pressable 
              style={styles.modSwitchButton} 
              onPress={() => setMod(mod === 'login' ? 'register' : 'login')}
            >
              <Text style={styles.modSwitchText}>
                {mod === 'login' 
                  ? 'Hesabınız yok mu? Hemen Kayıt Olun' 
                  : 'Zaten hesabınız var mı? Giriş Yapın'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
          <Text style={styles.uyeTipi}>Premium Üye</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Feather name="grid" size={24} color={renkler.vurgu} style={styles.statIcon} />
            <Text style={styles.statDeger}>{aracSayisi}</Text>
            <Text style={styles.statEtiket}>Kayıtlı Araç</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Feather name="award" size={24} color={renkler.sari} style={styles.statIcon} />
            <Text style={styles.statDeger}>{careScore}</Text>
            <Text style={styles.statEtiket}>Care Puanı</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Başarımlar</Text>
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Feather name="shield" size={24} color={renkler.yesil} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Güvenli Sürücü</Text>
              <Text style={styles.achievementDesc}>Tüm araç sigortalarınız güncel ve takip altında.</Text>
            </View>
          </View>
          
          <View style={styles.achievementCard}>
            <View style={[styles.achievementIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
              <Feather name="cpu" size={24} color={renkler.vurgu} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Teknoloji Dostu</Text>
              <Text style={styles.achievementDesc}>AI Danışmanını aktif olarak kullanıyorsunuz.</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={cikisYap}>
          <Feather name="log-out" size={20} color={renkler.hata} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: renkler.arkaPlan, padding: 20 },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
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
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: renkler.beyaz,
  },
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
  isimContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  isimText: {
    fontSize: 26,
    fontWeight: '800',
    color: renkler.metin,
    letterSpacing: -0.5,
  },
  editIcon: {
    marginLeft: 10,
    padding: 4,
  },
  isimEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
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
  kaydetButon: {
    backgroundColor: renkler.vurgu,
    padding: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  uyeTipi: {
    fontSize: 14,
    color: renkler.vurgu,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: renkler.kart,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statDeger: {
    fontSize: 28,
    fontWeight: '800',
    color: renkler.metin,
  },
  statEtiket: {
    fontSize: 13,
    color: renkler.metinIkincil,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: renkler.cizgi,
    marginHorizontal: 10,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: renkler.metin,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
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
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: renkler.metin,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 13,
    color: renkler.metinIkincil,
    lineHeight: 18,
  },
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
  logoutText: {
    color: renkler.hata,
    fontSize: 16,
    fontWeight: '700',
  },
  loginScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loginContainer: {
    padding: 24,
    justifyContent: 'center',
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  modSwitchButton: {
    marginTop: 24,
    padding: 8,
    alignItems: 'center',
  },
  modSwitchText: {
    color: renkler.vurgu,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: renkler.metin,
    marginBottom: 12,
    textAlign: 'center',
  },
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
  inputIcon: {
    marginRight: 12,
  },
  loginInput: {
    flex: 1,
    height: 56,
    fontSize: 16,
    color: renkler.metin,
  },
  loginButton: {
    backgroundColor: renkler.vurgu,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: renkler.vurgu,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
