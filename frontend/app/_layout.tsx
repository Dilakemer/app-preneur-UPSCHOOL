import React from 'react';
import { Stack } from 'expo-router';
import { AraclarProvider } from '../hooks/useAraclar';
import { NotificationProvider } from '../contexts/NotificationContext';
import { useNotificationObserver } from '../hooks/useNotificationObserver';

function RootStack() {
  useNotificationObserver();

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <NotificationProvider>
      <AraclarProvider>
        <RootStack />
      </AraclarProvider>
    </NotificationProvider>
  );
}
