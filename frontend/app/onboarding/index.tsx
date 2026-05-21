import React from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { renkler } from '../../constants/renkler';
import { Feather } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const router = useRouter();

  const tamamla = async () => {
    await AsyncStorage.setItem('@caremind:onboarding', '1');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name="shield" size={80} color={renkler.vurgu} />
        </View>
        <Text style={styles.title}>CareMind'e Hoş Geldiniz</Text>
        <Text style={styles.description}>
          Araç muayene, sigorta ve periyodik bakım tarihlerinizi unutun. Biz sizin yerinize takip edip, zamanı geldiğinde sizi uyaralım.
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Feather name="check-circle" size={20} color={renkler.yesil} />
            <Text style={styles.featureText}>Otomatik Bildirimler</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check-circle" size={20} color={renkler.yesil} />
            <Text style={styles.featureText}>AI Destekli Bakım Tavsiyeleri</Text>
          </View>
          <View style={styles.featureItem}>
            <Feather name="check-circle" size={20} color={renkler.yesil} />
            <Text style={styles.featureText}>Çevrimdışı Kullanım Desteği</Text>
          </View>
        </View>
      </View>

      <Pressable style={styles.button} onPress={tamamla}>
        <Text style={styles.buttonText}>Hemen Başlayın</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: renkler.arkaPlan,
    padding: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: renkler.vurguSoluk,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: renkler.metin,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: renkler.metinIkincil,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureList: {
    width: '100%',
    gap: 16,
    paddingHorizontal: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '600',
    color: renkler.metin,
  },
  button: {
    backgroundColor: renkler.vurgu,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: renkler.vurgu,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});
