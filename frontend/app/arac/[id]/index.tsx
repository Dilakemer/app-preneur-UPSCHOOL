import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AracKarti } from '../../../components/AracKarti';
import { renkler } from '../../../constants/renkler';
import { useAraclar } from '../../../hooks/useAraclar';
import { aiService } from '../../../services/aiService';
import { enYakinTarihBul, tarihFormatla } from '../../../utils/tarihHesapla';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  isLoading?: boolean;
}

export default function AracDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { aracGetir } = useAraclar();
  const arac = id ? aracGetir(id) : undefined;

  const [chatGorunur, setChatGorunur] = useState(false);
  const [mesajlar, setMesajlar] = useState<ChatMessage[]>([]);
  const [soru, setSoru] = useState('');
  const [aiCevapliyor, setAiCevapliyor] = useState(false);

  const handleChatAc = () => {
    if (mesajlar.length === 0) {
      setMesajlar([
        {
          id: 'welcome',
          text: `Merhaba. ${arac?.marka ?? 'Araciniz'} icin tarihleri, riskleri ve bakim onceliklerini birlikte inceleyebiliriz.`,
          isBot: true,
        },
      ]);
    }
    setChatGorunur(true);
  };

  const aiSoruSor = async (soruMetni: string, tip: 'tavsiye' | 'ozet' | 'uyari' = 'tavsiye') => {
    const temizSoru = soruMetni.trim();
    if (!arac || !temizSoru || aiCevapliyor) return;

    setAiCevapliyor(true);
    setSoru('');

    const kullaniciMesaji: ChatMessage = { id: `${Date.now()}-user`, text: temizSoru, isBot: false };
    const yukleniyorMesaji: ChatMessage = {
      id: `${Date.now()}-bot`,
      text: 'Analiz ediliyor...',
      isBot: true,
      isLoading: true,
    };

    setMesajlar((prev) => [...prev, kullaniciMesaji, yukleniyorMesaji]);

    try {
      const result = await aiService.getAracTavsiyesi(arac, tip, temizSoru);
      setMesajlar((prev) =>
        prev.map((msg) =>
          msg.id === yukleniyorMesaji.id ? { ...msg, text: result, isLoading: false } : msg,
        ),
      );
    } catch {
      setMesajlar((prev) =>
        prev.map((msg) =>
          msg.id === yukleniyorMesaji.id
            ? { ...msg, text: 'Bir hata olustu, lutfen tekrar deneyin.', isLoading: false }
            : msg,
        ),
      );
    } finally {
      setAiCevapliyor(false);
    }
  };

  if (!arac) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Arac bulunamadi.</Text>
      </View>
    );
  }

  const enYakin = enYakinTarihBul(arac);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={renkler.metin} />
          </Pressable>
          <Text style={styles.headerTitle}>Arac Detaylari</Text>
          <Pressable style={styles.headerAction} onPress={() => router.push(`/arac/${arac.id}/duzenle`)}>
            <Feather name="edit-2" size={18} color={renkler.vurgu} />
          </Pressable>
        </View>

        <AracKarti arac={arac} onPress={() => {}} />

        <View style={styles.infoCardsRow}>
          <View style={styles.infoCard}>
            <Feather name="alert-circle" size={24} color={renkler.vurgu} style={{ marginBottom: 8 }} />
            <Text style={styles.infoCardTitle}>Yaklasan Tarih</Text>
            {enYakin ? (
              <Text style={styles.infoCardText}>{`${enYakin.kategori.toUpperCase()}\n${tarihFormatla(enYakin.tarih)}`}</Text>
            ) : (
              <Text style={styles.infoCardText}>Henuz bir tarih eklenmedi.</Text>
            )}
          </View>
          <View style={styles.infoCard}>
            <Feather name="settings" size={24} color={renkler.mavi} style={{ marginBottom: 8 }} />
            <Text style={styles.infoCardTitle}>Durum</Text>
            <Text style={styles.infoCardText}>{enYakin ? 'Takip Ediliyor' : 'Veri Yok'}</Text>
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.push(`/arac/${arac.id}/duzenle`)}>
          <Feather name="edit-2" size={18} color={renkler.beyaz} style={{ marginRight: 8 }} />
          <Text style={styles.primaryText}>Bilgileri Duzenle</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push(`/sigorta-teklifi?aracId=${arac.id}`)}>
          <Feather name="shield" size={18} color={renkler.vurgu} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryText}>Sigorta Teklifi Al</Text>
        </Pressable>
      </ScrollView>

      <Pressable style={styles.fabChat} onPress={handleChatAc}>
        <Feather name="message-circle" size={28} color="#FFF" />
      </Pressable>

      <Modal visible={chatGorunur} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setChatGorunur(false)}>
        <KeyboardAvoidingView style={styles.chatModalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <View style={styles.chatBotIcon}>
                <Feather name="cpu" size={20} color="#A78BFA" />
              </View>
              <Text style={styles.chatHeaderTitle}>AI Danisman</Text>
            </View>
            <Pressable onPress={() => setChatGorunur(false)} style={styles.chatCloseBtn}>
              <Feather name="x" size={24} color={renkler.metin} />
            </Pressable>
          </View>

          <FlatList
            data={mesajlar}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.isBot ? styles.messageBot : styles.messageUser]}>
                {item.isBot ? (
                  <View style={styles.chatBotIconSmall}>
                    <Feather name="cpu" size={14} color="#A78BFA" />
                  </View>
                ) : null}
                <View style={[styles.messageBubble, item.isBot ? styles.bubbleBot : styles.bubbleUser]}>
                  {item.isLoading ? (
                    <ActivityIndicator size="small" color="#A78BFA" />
                  ) : (
                    <Text style={[styles.messageText, item.isBot ? styles.textBot : styles.textUser]}>{item.text}</Text>
                  )}
                </View>
              </View>
            )}
          />

          <View style={styles.chatQuickActions}>
            <Pressable
              style={styles.quickChip}
              onPress={() => aiSoruSor('Bana aracim hakkinda bakim tavsiyesi ver.', 'tavsiye')}
            >
              <Text style={styles.quickChipText}>Tavsiye Iste</Text>
            </Pressable>
            <Pressable
              style={styles.quickChip}
              onPress={() => aiSoruSor('Aracimin durumunu ozetler misin?', 'ozet')}
            >
              <Text style={styles.quickChipText}>Ozetle</Text>
            </Pressable>
            <Pressable
              style={styles.quickChip}
              onPress={() => aiSoruSor('Yaklasan kritik bir risk var mi?', 'uyari')}
            >
              <Text style={styles.quickChipText}>Risk</Text>
            </Pressable>
          </View>

          <View style={styles.chatComposer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Aracinla ilgili soru sor"
              placeholderTextColor={renkler.metinIkincil}
              value={soru}
              onChangeText={setSoru}
              multiline
              maxLength={240}
            />
            <Pressable
              style={[styles.sendButton, (!soru.trim() || aiCevapliyor) && styles.sendButtonDisabled]}
              onPress={() => aiSoruSor(soru)}
              disabled={!soru.trim() || aiCevapliyor}
            >
              <Feather name="send" size={18} color="#FFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: renkler.arkaPlan },
  notFoundText: { color: renkler.metin, padding: 20 },
  contentContainer: { gap: 20, padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: renkler.kart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: renkler.kart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: renkler.metin },
  infoCardsRow: { flexDirection: 'row', gap: 16 },
  infoCard: {
    flex: 1,
    backgroundColor: renkler.kart,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: renkler.cizgi,
  },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: renkler.metin, marginBottom: 6 },
  infoCardText: { color: renkler.metinIkincil, fontSize: 13, lineHeight: 18 },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: renkler.vurgu,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: renkler.beyaz, fontWeight: '700', fontSize: 16 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: renkler.cizgi,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
  },
  secondaryText: { color: renkler.vurgu, fontWeight: '700', fontSize: 16 },
  fabChat: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  chatModalContainer: { flex: 1, backgroundColor: renkler.arkaPlan },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: renkler.kart,
    borderBottomWidth: 1,
    borderBottomColor: renkler.cizgi,
  },
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  chatBotIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2E1065',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatHeaderTitle: { fontSize: 18, fontWeight: '800', color: renkler.metin },
  chatCloseBtn: { padding: 4 },
  chatList: { padding: 16, gap: 12 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  messageBot: { justifyContent: 'flex-start' },
  messageUser: { justifyContent: 'flex-end' },
  chatBotIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E1065',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 18 },
  bubbleBot: { backgroundColor: '#2E1065', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: renkler.vurgu, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  textBot: { color: '#EDE9FE' },
  textUser: { color: '#FFFFFF' },
  chatQuickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: renkler.kart,
    borderTopWidth: 1,
    borderTopColor: renkler.cizgi,
    gap: 12,
    justifyContent: 'center',
  },
  quickChip: { backgroundColor: renkler.vurguSoluk, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  quickChipText: { color: renkler.vurgu, fontWeight: '700', fontSize: 14 },
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
