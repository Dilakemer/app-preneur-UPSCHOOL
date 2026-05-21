import React, { useMemo, useState } from 'react';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { renkler } from '../constants/renkler';

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  mode?: 'date' | 'time';
  placeholder?: string;
  onChange: (value: Date | null) => void;
  clearable?: boolean;
}

const formatDate = (date: Date | null, mode: 'date' | 'time') => {
  if (!date) {
    return null;
  }

  if (mode === 'time') {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const DatePickerField = ({
  label,
  value,
  mode = 'date',
  placeholder = 'Secim yap',
  onChange,
  clearable = true,
}: DatePickerFieldProps) => {
  const [gorunur, setGorunur] = useState(false);

  const gosterilenDeger = useMemo(() => formatDate(value, mode), [mode, value]);

  const handleChange = (event: DateTimePickerEvent, secilenTarih?: Date) => {
    if (Platform.OS === 'android') {
      setGorunur(false);
    }

    if (event.type === 'dismissed') {
      return;
    }

    if (secilenTarih) {
      onChange(secilenTarih);
    }
  };

  return (
    <View style={styles.kapsayici}>
      <View style={styles.ustSatir}>
        <Text style={styles.label}>{label}</Text>
        {clearable && value ? (
          <Pressable onPress={() => onChange(null)}>
            <Text style={styles.temizle}>Temizle</Text>
          </Pressable>
        ) : null}
      </View>

      <Pressable onPress={() => setGorunur(true)} style={styles.girdi}>
        <Text style={[styles.girdiMetni, !gosterilenDeger && styles.placeholder]}>
          {gosterilenDeger ?? placeholder}
        </Text>
      </Pressable>

      {gorunur ? (
        <View style={styles.pickerKutusu}>
          <DateTimePicker
            value={value ?? new Date()}
            mode={mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour
            onChange={handleChange}
            themeVariant="dark"
            textColor={renkler.metin}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setGorunur(false)} style={styles.tamamButonu}>
              <Text style={styles.tamamMetni}>Tamam</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  kapsayici: {
    gap: 10,
  },
  ustSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: renkler.metin,
    fontSize: 15,
    fontWeight: '600',
  },
  temizle: {
    color: renkler.vurgu,
    fontSize: 13,
    fontWeight: '700',
  },
  girdi: {
    backgroundColor: renkler.arkaPlanKoyu,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  girdiMetni: {
    color: renkler.metin,
    fontSize: 15,
  },
  placeholder: {
    color: renkler.metinIkincil,
  },
  pickerKutusu: {
    backgroundColor: renkler.arkaPlanKoyu,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: renkler.cizgi,
    overflow: 'hidden',
  },
  tamamButonu: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  tamamMetni: {
    color: renkler.vurgu,
    fontWeight: '700',
  },
});
