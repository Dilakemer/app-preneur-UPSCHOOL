export type DurumRengi = 'red' | 'yellow' | 'green' | 'neutral';

export const durumRengiBelirle = (kalanGun: number): DurumRengi => {
  if (kalanGun < 0) return 'red';
  if (kalanGun <= 7) return 'red';
  if (kalanGun <= 30) return 'yellow';
  return 'green';
};

export const durumRengiCSS = (durum: DurumRengi): string => {
  switch (durum) {
    case 'red': return 'var(--color-red)';
    case 'yellow': return 'var(--color-yellow)';
    case 'green': return 'var(--color-green)';
    default: return 'var(--color-border)';
  }
};

export const durumRengiGlow = (durum: DurumRengi): string => {
  switch (durum) {
    case 'red': return 'var(--color-red-glow)';
    case 'yellow': return 'var(--color-yellow-glow)';
    case 'green': return 'var(--color-green-glow)';
    default: return 'transparent';
  }
};
