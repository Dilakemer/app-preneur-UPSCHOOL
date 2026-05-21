import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { renkler } from '../constants/renkler';

interface EmptyStateProps {
  onAdd: () => void;
}

export const EmptyState = ({ onAdd }: EmptyStateProps) => (
  <View style={styles.kapsayici}>
    <View style={styles.ikonKutusu}>
      <Feather name="grid" size={32} color={renkler.vurgu} />
    </View>
    <Text style={styles.baslik}>İlk aracınızı ekleyin</Text>
    <Text style={styles.aciklama}>
      CareMind, muayene, sigorta, kasko ve bakım tarihlerini tek bir premium panoda toplar.
    </Text>
    <Pressable onPress={onAdd} style={styles.buton}>
      <Feather name="plus" size={18} color={renkler.beyaz} style={{ marginRight: 6 }} />
      <Text style={styles.butonMetni}>Araç Ekle</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  kapsayici: {
    backgroundColor: renkler.kart,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ikonKutusu: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: renkler.vurguSoluk,
    marginBottom: 8,
  },
  baslik: {
    color: renkler.metin,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  aciklama: {
    color: renkler.metinIkincil,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  buton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: renkler.vurgu,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  butonMetni: {
    color: renkler.beyaz,
    fontWeight: '700',
    fontSize: 16,
  },
});
