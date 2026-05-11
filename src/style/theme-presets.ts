export interface ThemePreset {
  name: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  fontSize: string;
  radius: string;
}

export const themePresets: ThemePreset[] = [
  {
    name: 'Moss',
    primary: '#059669',
    primaryHover: '#047857',
    secondary: '#10b981',
    bgPrimary: '#f0fdf4',
    bgSecondary: '#dcfce7',
    bgTertiary: '#bbf7d0',
    textPrimary: '#14532d',
    textSecondary: '#166534',
    border: '#86efac',
    fontSize: '15px',
    radius: '8px',
  },
  {
    name: 'Mist',
    primary: '#64748b',
    primaryHover: '#475569',
    secondary: '#94a3b8',
    bgPrimary: '#f8fafc',
    bgSecondary: '#f1f5f9',
    bgTertiary: '#e2e8f0',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    border: '#cbd5e1',
    fontSize: '16px',
    radius: '6px',
  },
  {
    name: 'Clay',
    primary: '#c2410c',
    primaryHover: '#9a3412',
    secondary: '#ea580c',
    bgPrimary: '#fff7ed',
    bgSecondary: '#ffedd5',
    bgTertiary: '#fed7aa',
    textPrimary: '#431407',
    textSecondary: '#7c2d12',
    border: '#fdba74',
    fontSize: '17px',
    radius: '16px',
  },
  {
    name: 'Dusk',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    secondary: '#a78bfa',
    bgPrimary: '#faf5ff',
    bgSecondary: '#f3e8ff',
    bgTertiary: '#e9d5ff',
    textPrimary: '#2e1065',
    textSecondary: '#5b21b6',
    border: '#c4b5fd',
    fontSize: '16px',
    radius: '20px',
  },
  {
    name: 'Rose',
    primary: '#be123c',
    primaryHover: '#9f1239',
    secondary: '#e11d48',
    bgPrimary: '#fff1f2',
    bgSecondary: '#ffe4e6',
    bgTertiary: '#fecdd3',
    textPrimary: '#4c0519',
    textSecondary: '#881337',
    border: '#fda4af',
    fontSize: '15px',
    radius: '10px',
  },
];
