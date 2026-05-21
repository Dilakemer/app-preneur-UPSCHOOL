import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Catch in case it's already preventing auto hide
});

export default function OnboardingIndex() {
  const [tamamlandi, setTamamlandi] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@caremind:onboarding').then((v) => {
      setTamamlandi(v === '1' || v === 'true');
    }).finally(() => {
      // Hide splash screen when check is done
      SplashScreen.hideAsync();
    });
  }, []);

  if (tamamlandi === null) return null; // Returns null while splash is visible
  return <Redirect href={tamamlandi ? '/(tabs)' : '/onboarding/'} />;
}
