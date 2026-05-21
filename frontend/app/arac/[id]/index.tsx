import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAraclar } from '../../../hooks/useAraclar';
import { AracKarti } from '../../../components/AracKarti';
import { renkler } from '../../../constants/renkler';
import { tarihFormatla, enYakinTarihBul } from '../../../utils/tarihHesapla';
import { aiService } from '../../../services/aiService';

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

  const handleChatAc = () => {
    if (mesajlar.length === 0) {
      setMesajlar([{
        id: '1',
        text: `Merhaba! Ben CareMind Yapay Zeka Danışmanınızım. ${arac?.marka} aracınızla ilgili size nasıl yardımcı olabilirim?`,
        isBot: true
      }]);
    }
    setChatGorunur(true);
  };

  const aiSoruSor = async (soruMetni: string, tip: 'tavsiye' | 'ozet' | 'uyari' = 'tavsiye') => {
    if (!arac) return;
    
    const yeniKullaniciMesaji: ChatMessage = { id: Date.now().toString(), text: soruMetni, isBot: false };
    const yukleniyorMesaji: ChatMessage = { id: (Date.now() + 1).toString(), text: 'Analiz ediliyor...', isBot: true, isLoading: true };
    
    setMesajlar(prev => [...prev, yeniKullaniciMesaji, yukleniyorMesaji]);

    try {
      const result = await aiService.getAracTavsiyesi(arac, tip);
      
      setMesajlar(prev => 
        prev.map(msg => msg.id === yukleniyorMesaji.id ? { ...msg, text: result, isLoading: false } : msg)
      );
    } catch (e) {
      setMesajlar(prev => 
        prev.map(msg => msg.id === yukleniyorMesaji.id ? { ...msg, text: 'Bir hata oluştu, lütfen tekrar deneyin.', isLoading: false } : msg)
      );
    }
  };

  if (!arac) return <Text style={{ padding: 20, color: renkler.metin }}>Araç bulunamadı.</Text>;

  const enYakin = enYakinTarihBul(arac);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={renkler.metin} />
          </Pressable>
          <Text style={styles.headerTitle}>Araç Detayları</Text>
          <View style={{ width: 40 }} />
        </View>

        <AracKarti arac={arac} onPress={() => {}} />

        <View style={styles.infoCardsRow}>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <Feather name="alert-circle" size={24} color={renkler.vurgu} style={{ marginBottom: 8 }} />
            <Text style={styles.infoCardTitle}>Yaklaşan Tarih</Text>
            {enYakin ? (
              <Text style={styles.infoCardText}>{`${enYakin.kategori.toUpperCase()}\n${tarihFormatla(enYakin.tarih)}`}</Text>
            ) : (
              <Text style={styles.infoCardText}>Henüz bir tarih eklenmedi.</Text>
            )}
          </View>
          <View style={[styles.infoCard, { flex: 1 }]}>
            <Feather name="settings" size={24} color={renkler.mavi} style={{ marginBottom: 8 }} />
            <Text style={styles.infoCardTitle}>Durum</Text>
            <Text style={styles.infoCardText}>{enYakin ? 'Takip Ediliyor' : 'Veri Yok'}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Pressable style={styles.primaryButton} onPress={() => router.push(`/arac/${arac.id}/duzenle`)}>
            <Feather name="edit-2" size={18} color={renkler.beyaz} style={{ marginRight: 8 }} />
            <Text style={styles.primaryText}>Bilgileri Düzenle</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating Chatbot Button */}
      <Pressable style={styles.fabChat} onPress={handleChatAc}>
        <Feather name="message-circle" size={28} color="#FFF" />
      </Pressable>

      {/* Chatbot Modal */}
      <Modal visible={chatGorunur} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setChatGorunur(false)}>
        <KeyboardAvoidingView style={styles.chatModalContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.chatHeader}>
            <View style={styles.chatHeaderLeft}>
              <View style={styles.chatBotIcon}>
                <Feather name="cpu" size={20} color="#A78BFA" />
              </View>
              <Text style={styles.chatHeaderTitle}>AI Danışman</Text>
            </View>
            <Pressable onPress={() => setChatGorunur(false)} style={styles.chatCloseBtn}>
              <Feather name="x" size={24} color={renkler.metin} />
            </Pressable>
          </View>
          
          <FlatList
            data={mesajlar}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.chatList}
            renderItem={({ item }) => (
              <View style={[styles.messageRow, item.isBot ? styles.messageBot : styles.messageUser]}>
                {item.isBot && (
                  <View style={styles.chatBotIconSmall}>
                    <Feather name="cpu" size={14} color="#A78BFA" />
                  </View>
                )}
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
            <Pressable style={styles.quickChip} onPress={() => aiSoruSor('Bana aracım hakkında bakım tavsiyesi ver.', 'tavsiye')}>
              <Text style={styles.quickChipText}>Tavsiye İste</Text>
            </Pressable>
            <Pressable style={styles.quickChip} onPress={() => aiSoruSor('Aracımın durumunu özetler misin?', 'ozet')}>
              <Text style={styles.quickChipText}>Özetle</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: renkler.arkaPlan },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: renkler.metin,
  },
  infoCardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoCard: {
    backgroundColor: renkler.kart,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: renkler.cizgi,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: renkler.metin,
    marginBottom: 6,
  },
  infoCardText: {
    color: renkler.metinIkincil,
    fontSize: 13,
    lineHeight: 18,
  },
  actionButtons: {
    marginTop: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: renkler.vurgu,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: renkler.beyaz,
    fontWeight: '700',
    fontSize: 16,
  },
  fabChat: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7C3AED', // mor
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: renkler.arkaPlan,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: renkler.kart,
    borderBottomWidth: 1,
    borderBottomColor: renkler.cizgi,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatBotIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2E1065',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: renkler.metin,
  },
  chatCloseBtn: {
    padding: 4,
  },
  chatList: {
    padding: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageBot: {
    justifyContent: 'flex-start',
  },
  messageUser: {
    justifyContent: 'flex-end',
  },
  chatBotIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2E1065',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
  },
  bubbleBot: {
    backgroundColor: '#2E1065',
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: renkler.vurgu,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  textBot: {
    color: '#EDE9FE',
  },
  textUser: {
    color: '#FFFFFF',
  },
  chatQuickActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: renkler.kart,
    borderTopWidth: 1,
    borderTopColor: renkler.cizgi,
    gap: 12,
    justifyContent: 'center'
  },
  quickChip: {
    backgroundColor: renkler.vurguSoluk,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickChipText: {
    color: renkler.vurgu,
    fontWeight: '700',
    fontSize: 14,
  }
});
