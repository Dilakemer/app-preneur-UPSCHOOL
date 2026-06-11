import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

export const useNotificationObserver = () => {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let aktif = true;
    let abonelik: { remove: () => void } | undefined;

    const sonYanitiKontrolEt = async () => {
      const Notifications = await import('expo-notifications');
      const sonYanit = await Notifications.getLastNotificationResponseAsync();
      const aracId = sonYanit?.notification.request.content.data?.aracId;

      if (aktif && typeof aracId === 'string') {
        router.push(`/arac/${aracId}`);
      }
    };

    const dinleyiciEkle = async () => {
      const Notifications = await import('expo-notifications');
      abonelik = Notifications.addNotificationResponseReceivedListener((yanit) => {
        const aracId = yanit.notification.request.content.data?.aracId;

        if (typeof aracId === 'string') {
          router.push(`/arac/${aracId}`);
        }
      });
    };

    sonYanitiKontrolEt();
    dinleyiciEkle();

    return () => {
      aktif = false;
      abonelik?.remove();
    };
  }, [router]);
};
