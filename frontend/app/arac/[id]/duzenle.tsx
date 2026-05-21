import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AracForm } from '../../../components/AracForm';
import { renkler } from '../../../constants/renkler';

export default function AracDuzenleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Araç Düzenle</Text>
      <AracForm mode="edit" aracId={id} />
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
