import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AracKarti } from '../../components/AracKarti';
import { BildirimIzinBanner } from '../../components/BildirimIzinBanner';
import { EmptyState } from '../../components/EmptyState';
import { renkler } from '../../constants/renkler';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAraclar } from '../../hooks/useAraclar';
import { aiService } from '../../services/aiService';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  isLoading?: boolean;
}

export default function AnaEkran() {
  const router = useRouter();
  const { araclar, yukleniyor, yenileniyor, yenile, bildirimKotaMesaji } = useAraclar();
  const { izinDurumu } = useNotificationContext();
  const [refreshing, setRefreshing] = useState(false);
  const [izinBannerKapali, setIzinBannerKapali] = useState(false);
  const [chatGorunur, setChatGorunur] = useState(false);
  const [mesajlar, setMesajlar] = useState<ChatMessage[]>([]);
  const [soru, setSoru] = useState('');
  const [aiCevapliyor, setAiCevapliyor] = useState(false);

  const toplamTarih = useMemo(
    () =>
      araclar.reduce(
        (adet, arac) =>
          adet +
          [arac.muayeneTarihi, arac.sigortaTarihi, arac.kaskoTarihi, arac.bakimTarihi].filter(Boolean)
            .length,
        0,
      ),
    [araclar],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await yenile();
    } finally {
      setRefreshing(false);
    }
  }, [yenile]);

  const handleChatAc = () => {
    if (mesajlar.length === 0) {
      setMesajlar([
        {
          id: 'welcome',
          text: 'Merhaba. Arac eklemeden de sigorta, muayene ve bakim planini birlikte netlestirebiliriz.',
          isBot: true,
        },
      ]);
    }

    setChatGorunur(true);
  };

  const genelAiSoruSor = async (soruMetni: string, tip: 'tavsiye' | 'ozet' | 'uyari' = 'tavsiye') => {
    const temizSoru = soruMetni.trim();
    if (!temizSoru || aiCevapliyor) return;

    setAiCevapliyor(true);
    setSoru('');

    const kullaniciMesaji: ChatMessage = { id: `${Date.now()}-user`, text: temizSoru, isBot: false };
    const yukleniyorMesaji: ChatMessage = {
      id: `${Date.now()}-bot`,
      text: 'Hazirlaniyor...',
      isBot: true,
      isLoading: true,
    };

    setMesajlar((prev) => [...prev, kullaniciMesaji, yukleniyorMesaji]);

    try {
      const result = await aiService.getGenelTavsiye(temizSoru, tip);
      setMesajlar((prev) =>
        prev.map((msg) => (msg.id === yukleniyorMesaji.id ? { ...msg, text: result, isLoading: false } : msg)),
      );
    } finally {
      setAiCevapliyor(false);
    }
  };

  if (yukleniyor) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Yukleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {araclar.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState onAdd={() => router.push('/arac/ekle')} />
          <Pressable style={styles.aiEntry} onPress={handleChatAc}>
            <View style={styles.aiIcon}>
              <Feather name="cpu" size={20} color={renkler.vurgu} />
            </View>
            <View style={styles.aiEntryText}>
              <Text style={styles.aiEntryTitle}>AI danisman hazir</Text>
              <Text style={styles.aiEntryDesc}>Arac eklemeden genel sigorta, muayene ve bakim sorularini sor.</Text>
            </View>
            <Feather name="message-circle" size={20} color={renkler.metinIkincil} />
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={araclar}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View style={styles.headerContent}>
              {izinDurumu === 'denied' && !izinBannerKapali ? (
                <BildirimIzinBanner
                  onOpenSettings={() => Linking.openSettings()}
                  onDismiss={() => setIzinBannerKapali(true)}
                />
              ) : null}

              <View style={styles.summary}>
                <View>
                  <Text style={styles.summaryLabel}>Aktif takip</Text>
                  <Text style={styles.summaryTitle}>{araclar.length} arac</Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Text style={styles.summaryMetricValue}>{toplamTarih}</Text>
                  <Text style={styles.summaryMetricLabel}>tarih</Text>
                </View>
                {bildirimKotaMesaji ? <Text style={styles.warningText}>{bildirimKotaMesaji}</Text> : null}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <AracKarti arac={item} onPress={() => router.push(`/arac/${item.id}`)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || yenileniyor}
              onRefresh={handleRefresh}
              tintColor={renkler.vurgu}
            />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/arac/ekle')} activeOpacity={0.8}>
        <Feather name="plus" size={28} color={renkler.beyaz} />
      </TouchableOpacity>

      <Modal visible={chatGorunur} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setChatGorunur(false)}>
        <KeyboardAvoidingView style={styles.chatModalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <View style={styles.chatBotIcon}>
                <Feather name="cpu" size={20} color={renkler.vurgu} />
              </View>
              <Text style={styles.chatHeaderTitle}>AI Danisman</Text>
            </View>
            <Pressable onPress={() => setChatGorunur(false)} style={styles.chatCloseBtn}>
              <Feather name="x" size={24} color={renkler.metin} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.chatList}>
            {mesajlar.map((item) => (
              <View key={item.id} style={[styles.messageRow, item.isBot ? styles.messageBot : styles.messageUser]}>
                {item.isBot ? (
                  <View style={styles.chatBotIconSmall}>
                    <Feather name="cpu" size={14} color={renkler.vurgu} />
                  </View>
                ) : null}
                <View style={[styles.messageBubble, item.isBot ? styles.bubbleBot : styles.bubbleUser]}>
                  {item.isLoading ? (
                    <ActivityIndicator size="small" color={renkler.vurgu} />
                  ) : (
                    <Text style={[styles.messageText, item.isBot ? styles.textBot : styles.textUser]}>{item.text}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatQuickActions}>
            <Pressable style={styles.quickChip} onPress={() => genelAiSoruSor('Arac eklemeden hangi tarihleri takip etmeliyim?', 'tavsiye')}>
              <Text style={styles.quickChipText}>Baslangic</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => genelAiSoruSor('Sigorta yenilerken nelere dikkat etmeliyim?', 'ozet')}>
              <Text style={styles.quickChipText}>Sigorta</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => genelAiSoruSor('Bakim ve muayene icin riskli gecikmeler neler?', 'uyari')}>
              <Text style={styles.quickChipText}>Risk</Text>
            </Pressable>
          </View>

          <View style={styles.chatComposer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Genel arac sorusu sor"
              placeholderTextColor={renkler.metinIkincil}
              value={soru}
              onChangeText={setSoru}
              multiline
              maxLength={240}
            />
            <Pressable
              style={[styles.sendButton, (!soru.trim() || aiCevapliyor) && styles.sendButtonDisabled]}
              onPress={() => genelAiSoruSor(soru)}
              disabled={!soru.trim() || aiCevapliyor}
            >
              <Feather name="send" size={18} color={renkler.beyaz} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10, backgroundColor: renkler.arkaPlan },
  loadingText: { padding: 20, color: renkler.metinIkincil },
  listContent: { paddingVertical: 12, paddingBottom: 100, gap: 16 },
  emptyWrap: { gap: 16, marginTop: 40, padding: 16 },
  aiEntry: {
    alignItems: 'center',
    backgroundColor: renkler.kart,
    borderColor: renkler.cizgi,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  aiIcon: {
    alignItems: 'center',
    backgroundColor: renkler.vurguSoluk,
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  aiEntryText: { flex: 1 },
  aiEntryTitle: { color: renkler.metin, fontSize: 16, fontWeight: '800' },
  aiEntryDesc: { color: renkler.metinIkincil, lineHeight: 19, marginTop: 3 },
  headerContent: { gap: 16 },
  summary: {
    alignItems: 'center',
    backgroundColor: renkler.kart,
    borderColor: renkler.cizgi,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
  },
  summaryLabel: {
    color: renkler.metinIkincil,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryTitle: {
    color: renkler.metin,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  summaryMetric: {
    alignItems: 'flex-end',
  },
  summaryMetricValue: {
    color: renkler.vurgu,
    fontSize: 28,
    fontWeight: '800',
  },
  summaryMetricLabel: {
    color: renkler.metinIkincil,
    fontSize: 12,
    fontWeight: '700',
  },
  warningText: {
    color: renkler.sari,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: -18,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: renkler.vurgu,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: renkler.vurgu,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  chatModalContainer: { flex: 1, backgroundColor: renkler.arkaPlan },
  chatHeader: {
    alignItems: 'center',
    backgroundColor: renkler.kart,
    borderBottomColor: renkler.cizgi,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  chatHeaderLeft: { alignItems: 'center', flexDirection: 'row' },
  chatBotIcon: {
    alignItems: 'center',
    backgroundColor: renkler.vurguSoluk,
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    marginRight: 10,
    width: 36,
  },
  chatHeaderTitle: { color: renkler.metin, fontSize: 18, fontWeight: '800' },
  chatCloseBtn: { padding: 4 },
  chatList: { gap: 12, padding: 16 },
  messageRow: { alignItems: 'flex-end', flexDirection: 'row', marginBottom: 12 },
  messageBot: { justifyContent: 'flex-start' },
  messageUser: { justifyContent: 'flex-end' },
  chatBotIconSmall: {
    alignItems: 'center',
    backgroundColor: renkler.vurguSoluk,
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 8,
    width: 28,
  },
  messageBubble: { borderRadius: 18, maxWidth: '80%', padding: 14 },
  bubbleBot: { backgroundColor: renkler.kart, borderBottomLeftRadius: 4, borderColor: renkler.cizgi, borderWidth: 1 },
  bubbleUser: { backgroundColor: renkler.vurgu, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  textBot: { color: renkler.metin },
  textUser: { color: renkler.beyaz },
  chatQuickActions: {
    backgroundColor: renkler.kart,
    borderTopColor: renkler.cizgi,
    borderTopWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    padding: 16,
  },
  quickChip: { backgroundColor: renkler.vurguSoluk, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  quickChipText: { color: renkler.vurgu, fontSize: 14, fontWeight: '800' },
  chatComposer: {
    alignItems: 'flex-end',
    backgroundColor: renkler.kart,
    borderTopColor: renkler.cizgi,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  chatInput: {
    backgroundColor: renkler.arkaPlan,
    borderColor: renkler.cizgi,
    borderRadius: 16,
    borderWidth: 1,
    color: renkler.metin,
    flex: 1,
    maxHeight: 110,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: renkler.vurgu,
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  sendButtonDisabled: { opacity: 0.45 },
});
