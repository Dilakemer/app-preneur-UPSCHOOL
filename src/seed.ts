import { v4 as uuidv4 } from 'uuid';
import { Arac } from './types';

// Başlangıç için örnek araçlar
default export const ornekAraclar: Arac[] = [
  {
    id: uuidv4(),
    plaka: '34ABC123',
    marka: 'Renault',
    model: 'Clio',
    yil: 2018,
    muayeneTarihi: '2026-09-01',
    sigortaTarihi: '2026-06-15',
    kaskoTarihi: '2026-07-10',
    bakimTarihi: '2026-05-20',
    bildirimler: { gun60: true, gun30: true },
  },
];
