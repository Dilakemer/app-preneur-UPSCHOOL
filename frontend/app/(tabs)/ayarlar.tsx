import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { DatePickerField } from '../../components/DatePickerField';
import { renkler } from '../../constants/renkler';
import { useAraclar } from '../../hooks/useAraclar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export default function AyarlarScreen() {
  const { varsayilanBildirimSaati, varsayilanSaatiGuncelle, tumVerileriSil } = useAraclar();
  const [bildirimSaati, setBildirimSaati] = useState<Date | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    // parse varsayilanBildirimSaati (HH:MM)
    const [hh = '09', mm = '00'] = varsayilanBildirimSaati.split(':');
    const d = new Date();
    d.setHours(Number(hh), Number(mm), 0, 0);
    setBildirimSaati(d);

    AsyncStorage.getItem('@caremind:notificationsEnabled').then((v) => {
      setNotificationsEnabled(v === null ? true : v === '1' || v === 'true');
    });
  }, [varsayilanBildirimSaati]);

  const handleSaatChange = useCallback(
    (d: Date | null) => {
      setBildirimSaati(d);
      if (!d) return;
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      varsayilanSaatiGuncelle(`${hh}:${mm}`);
    },
    [varsayilanSaatiGuncelle],
  );

  const toggleNotifications = useCallback(
    (val: boolean) => {
      setNotificationsEnabled(val);
      AsyncStorage.setItem('@caremind:notificationsEnabled', val ? '1' : '0');
    },
    [],
  );

  const handleClear = useCallback(() => {
    Alert.alert('Tüm verileri sil', 'Tüm araç verileri silinecektir. Devam edilsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => await tumVerileriSil() },
    ]);
  }, [tumVerileriSil]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>
      <Text style={styles.subtitle}>Tercihlerinizi yönetin.</Text>

      <View style={styles.sectionBlock}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Feather name="bell" size={20} color={renkler.vurgu} style={{ marginRight: 12 }} />
            <Text style={styles.label}>Bildirimleri Etkinleştir</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            thumbColor={renkler.beyaz}
            trackColor={{ false: renkler.arkaPlanKoyu, true: renkler.vurgu }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.rowLeft}>
            <Feather name="clock" size={20} color={renkler.mavi} style={{ marginRight: 12 }} />
            <Text style={styles.label}>Varsayılan Bildirim Saati</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <DatePickerField label="" mode="time" value={bildirimSaati} onChange={handleSaatChange} clearable={false} />
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <Pressable style={styles.clearButton} onPress={handleClear}>
        <Feather name="trash-2" size={18} color="#EF4444" style={{ marginRight: 8 }} />
        <Text style={styles.clearText}>Tüm verileri sil</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: renkler.arkaPlan },
  title: { fontSize: 26, fontWeight: '800', color: renkler.metin, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: renkler.metinIkincil, marginBottom: 24, marginTop: 4 },
  sectionBlock: {
    backgroundColor: renkler.kart,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', color: renkler.metin },
  divider: { height: 1, backgroundColor: renkler.cizgi, marginVertical: 20 },
  section: {},
  clearButton: { 
    flexDirection: 'row',
    padding: 16, 
    borderRadius: 16, 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  clearText: { color: '#EF4444', fontWeight: '700', fontSize: 16 },
});
