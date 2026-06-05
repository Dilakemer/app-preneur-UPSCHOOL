import React from 'react';
import { Stack } from 'expo-router';
import { AraclarProvider } from '../hooks/useAraclar';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  return (
    <NotificationProvider>
      <AraclarProvider>
        <Stack />
      </AraclarProvider>
    </NotificationProvider>
  );
}
