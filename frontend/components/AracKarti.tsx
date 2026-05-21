import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Arac } from '../types/Arac';
import { KATEGORI_BASLIKLARI } from '../types/Arac';
import { enYakinTarihBul, kalanGunMetni, tarihFormatla } from '../utils/tarihHesapla';
import { durumRengiBelirle } from '../utils/renkBelirle';
import { renkler } from '../constants/renkler';

interface AracKartiProps {
  arac: Arac;
  onPress: () => void;
}

export const AracKarti = ({ arac, onPress }: AracKartiProps) => {
  const enYakin = enYakinTarihBul(arac);
  const durum = enYakin ? durumRengiBelirle(enYakin.kalanGun) : 'neutral';

  const getDurumRengi = (durum: string) => {
    switch (durum) {
      case 'acil': return renkler.kirmizi;
      case 'yaklasiyor': return renkler.sari;
      case 'rahat': return renkler.yesil;
      default: return renkler.cizgi;
    }
  };

  const gostergeRengi = getDurumRengi(durum);

  return (
    <Pressable onPress={onPress} style={styles.kapsayici}>
      <View style={[styles.durumCizgisi, { backgroundColor: gostergeRengi }]} />
      
      <View style={styles.icerik}>
        <View style={styles.ustAlan}>
          <View style={styles.metinler}>
            <Text style={styles.baslik}>
              {[arac.marka, arac.model].filter(Boolean).join(' ')} <Text style={styles.yilText}>({arac.yil})</Text>
            </Text>
            <View style={styles.plakaRozeti}>
              <Feather name="hash" size={14} color={renkler.vurgu} />
              <Text style={styles.plakaMetni}>{arac.plaka}</Text>
            </View>
          </View>
        </View>

        <View style={styles.altAlan}>
          <View style={styles.bilgiKutusu}>
            <Feather name="calendar" size={16} color={renkler.metinIkincil} style={{ marginRight: 6 }} />
            <Text style={styles.altBaslik}>
              {enYakin
                ? `${KATEGORI_BASLIKLARI[enYakin.kategori]}: ${tarihFormatla(enYakin.tarih)}`
                : 'Tarih eklenmedi'}
            </Text>
          </View>
          
          <View style={[styles.durumRozeti, { backgroundColor: gostergeRengi + '20' }]}>
            <Text style={[styles.kalanGun, { color: durum === 'neutral' ? renkler.metinIkincil : gostergeRengi }]}>
              {enYakin ? kalanGunMetni(enYakin.kalanGun) : 'Takip Et'}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  kapsayici: {
    flexDirection: 'row',
    backgroundColor: renkler.kart,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
  },
  durumCizgisi: {
    width: 6,
    height: '100%',
  },
  icerik: {
    flex: 1,
    padding: 18,
    gap: 16,
  },
  ustAlan: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metinler: {
    flex: 1,
    gap: 8,
  },
  baslik: {
    color: renkler.metin,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  yilText: {
    color: renkler.metinIkincil,
    fontSize: 18,
    fontWeight: '500',
  },
  plakaRozeti: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: renkler.vurguSoluk,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  plakaMetni: {
    color: renkler.vurgu,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    marginLeft: 4,
  },
  altAlan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  bilgiKutusu: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  altBaslik: {
    color: renkler.metinIkincil,
    fontSize: 14,
    fontWeight: '500',
  },
  durumRozeti: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kalanGun: {
    fontSize: 13,
    fontWeight: '700',
  },
});
