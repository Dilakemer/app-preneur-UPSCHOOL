import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AracForm } from '../../components/AracForm';
import { renkler } from '../../constants/renkler';

export default function AracEkleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Araç Ekle</Text>
      <AracForm mode="create" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: renkler.arkaPlan 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: renkler.metin,
    marginBottom: 24,
    letterSpacing: -0.5
  },
});
