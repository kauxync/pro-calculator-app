export type ThemeId =
  | 'midnight'
  | 'cyberpunk'
  | 'emerald'
  | 'sunset'
  | 'nordic'
  | 'pure_light'
  | 'paper_warm'
  | 'lavender_light';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  description: string;
  isLight: boolean;
  background: string;
  surface: string;
  surfaceLight: string;
  surfaceHighlight: string;
  surfaceBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;

  // Keypad
  btnNumberBg: string;
  btnNumberText: string;
  btnNumberBorder: string;

  btnActionBg: string;
  btnActionText: string;
  btnActionBorder: string;

  btnOperatorBg: string;
  btnOperatorPressed: string;
  btnOperatorText: string;

  btnScientificBg: string;
  btnScientificText: string;
  btnScientificBorder: string;

  accent: string;
  accentGlow: string;
  danger: string;
  success: string;
  previewColors: string[]; // For theme preview cards
}

export const THEMES: Record<ThemeId, ThemePalette> = {
  midnight: {
    id: 'midnight',
    name: 'OLED Midnight',
    description: 'Deep black with luminous cyan and amber',
    isLight: false,
    background: '#07090E',
    surface: '#121624',
    surfaceLight: '#1B2236',
    surfaceHighlight: '#26304D',
    surfaceBorder: 'rgba(255, 255, 255, 0.08)',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    btnNumberBg: '#141926',
    btnNumberText: '#F1F5F9',
    btnNumberBorder: 'rgba(255, 255, 255, 0.05)',

    btnActionBg: '#222B40',
    btnActionText: '#CBD5E1',
    btnActionBorder: 'rgba(255, 255, 255, 0.08)',

    btnOperatorBg: '#F59E0B',
    btnOperatorPressed: '#D97706',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#182035',
    btnScientificText: '#38BDF8',
    btnScientificBorder: 'rgba(56, 189, 248, 0.25)',

    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.15)',
    danger: '#EF4444',
    success: '#10B981',
    previewColors: ['#07090E', '#F59E0B', '#38BDF8'],
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    description: 'Futuristic purple with neon pink and cyan',
    isLight: false,
    background: '#0B0714',
    surface: '#170E29',
    surfaceLight: '#23153D',
    surfaceHighlight: '#361F5E',
    surfaceBorder: 'rgba(244, 63, 94, 0.15)',
    text: '#FDF4FF',
    textSecondary: '#D8B4FE',
    textMuted: '#9333EA',

    btnNumberBg: '#1C1133',
    btnNumberText: '#F5D0FE',
    btnNumberBorder: 'rgba(216, 180, 254, 0.08)',

    btnActionBg: '#2E1A52',
    btnActionText: '#E879F9',
    btnActionBorder: 'rgba(232, 121, 249, 0.2)',

    btnOperatorBg: '#F43F5E',
    btnOperatorPressed: '#E11D48',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#23123D',
    btnScientificText: '#22D3EE',
    btnScientificBorder: 'rgba(34, 211, 238, 0.3)',

    accent: '#22D3EE',
    accentGlow: 'rgba(34, 211, 238, 0.2)',
    danger: '#FB7185',
    success: '#34D399',
    previewColors: ['#0B0714', '#F43F5E', '#22D3EE'],
  },

  emerald: {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Carbon dark with electric emerald and mint',
    isLight: false,
    background: '#060E0C',
    surface: '#0E1E1B',
    surfaceLight: '#152C28',
    surfaceHighlight: '#1E3E38',
    surfaceBorder: 'rgba(16, 185, 129, 0.15)',
    text: '#ECFDF5',
    textSecondary: '#A7F3D0',
    textMuted: '#059669',

    btnNumberBg: '#0F211D',
    btnNumberText: '#D1FAE5',
    btnNumberBorder: 'rgba(52, 211, 153, 0.08)',

    btnActionBg: '#183832',
    btnActionText: '#6EE7B7',
    btnActionBorder: 'rgba(110, 231, 183, 0.2)',

    btnOperatorBg: '#10B981',
    btnOperatorPressed: '#059669',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#122622',
    btnScientificText: '#34D399',
    btnScientificBorder: 'rgba(52, 211, 153, 0.3)',

    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.2)',
    danger: '#F87171',
    success: '#34D399',
    previewColors: ['#060E0C', '#10B981', '#34D399'],
  },

  sunset: {
    id: 'sunset',
    name: 'Solar Sunset',
    description: 'Warm espresso with sunset orange and gold',
    isLight: false,
    background: '#0F0B09',
    surface: '#1F1612',
    surfaceLight: '#2D1F1A',
    surfaceHighlight: '#432E27',
    surfaceBorder: 'rgba(249, 115, 22, 0.15)',
    text: '#FFF7ED',
    textSecondary: '#FED7AA',
    textMuted: '#C2410C',

    btnNumberBg: '#1E1410',
    btnNumberText: '#FFEDD5',
    btnNumberBorder: 'rgba(254, 215, 170, 0.08)',

    btnActionBg: '#33211B',
    btnActionText: '#FDBA74',
    btnActionBorder: 'rgba(253, 186, 116, 0.2)',

    btnOperatorBg: '#EA580C',
    btnOperatorPressed: '#C2410C',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#271914',
    btnScientificText: '#FBBF24',
    btnScientificBorder: 'rgba(251, 191, 36, 0.3)',

    accent: '#F97316',
    accentGlow: 'rgba(249, 115, 22, 0.2)',
    danger: '#EF4444',
    success: '#22C55E',
    previewColors: ['#0F0B09', '#EA580C', '#FBBF24'],
  },

  nordic: {
    id: 'nordic',
    name: 'Nordic Slate',
    description: 'Cool Arctic slate with glacier blue and indigo',
    isLight: false,
    background: '#0B1120',
    surface: '#141E33',
    surfaceLight: '#1E2C4A',
    surfaceHighlight: '#2A3C63',
    surfaceBorder: 'rgba(96, 165, 250, 0.15)',
    text: '#F0F9FF',
    textSecondary: '#BAE6FD',
    textMuted: '#38BDF8',

    btnNumberBg: '#152037',
    btnNumberText: '#E0F2FE',
    btnNumberBorder: 'rgba(186, 230, 253, 0.08)',

    btnActionBg: '#223356',
    btnActionText: '#7DD3FC',
    btnActionBorder: 'rgba(125, 211, 252, 0.2)',

    btnOperatorBg: '#3B82F6',
    btnOperatorPressed: '#2563EB',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#192744',
    btnScientificText: '#38BDF8',
    btnScientificBorder: 'rgba(56, 189, 248, 0.3)',

    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.2)',
    danger: '#F87171',
    success: '#34D399',
    previewColors: ['#0B1120', '#3B82F6', '#38BDF8'],
  },

  // LIGHT THEMES
  pure_light: {
    id: 'pure_light',
    name: 'Snow White (Light)',
    description: 'Pristine modern minimalist white with vivid azure',
    isLight: true,
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceLight: '#F1F5F9',
    surfaceHighlight: '#E2E8F0',
    surfaceBorder: 'rgba(0, 0, 0, 0.08)',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',

    btnNumberBg: '#FFFFFF',
    btnNumberText: '#0F172A',
    btnNumberBorder: 'rgba(0, 0, 0, 0.08)',

    btnActionBg: '#E2E8F0',
    btnActionText: '#334155',
    btnActionBorder: 'rgba(0, 0, 0, 0.06)',

    btnOperatorBg: '#F59E0B',
    btnOperatorPressed: '#D97706',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#E0F2FE',
    btnScientificText: '#0284C7',
    btnScientificBorder: 'rgba(2, 132, 199, 0.2)',

    accent: '#0284C7',
    accentGlow: 'rgba(2, 132, 199, 0.12)',
    danger: '#EF4444',
    success: '#10B981',
    previewColors: ['#F8FAFC', '#F59E0B', '#0284C7'],
  },

  paper_warm: {
    id: 'paper_warm',
    name: 'Warm Parchment (Light)',
    description: 'Cozy warm sand with terra cotta and terracotta',
    isLight: true,
    background: '#FBF9F5',
    surface: '#FFFFFF',
    surfaceLight: '#F4EFEA',
    surfaceHighlight: '#EAE2D8',
    surfaceBorder: 'rgba(68, 64, 60, 0.1)',
    text: '#292524',
    textSecondary: '#57534E',
    textMuted: '#A8A29E',

    btnNumberBg: '#FFFFFF',
    btnNumberText: '#292524',
    btnNumberBorder: 'rgba(68, 64, 60, 0.08)',

    btnActionBg: '#EAE2D8',
    btnActionText: '#44403C',
    btnActionBorder: 'rgba(68, 64, 60, 0.08)',

    btnOperatorBg: '#EA580C',
    btnOperatorPressed: '#C2410C',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#FEF3C7',
    btnScientificText: '#D97706',
    btnScientificBorder: 'rgba(217, 119, 6, 0.25)',

    accent: '#EA580C',
    accentGlow: 'rgba(234, 88, 12, 0.12)',
    danger: '#EF4444',
    success: '#16A34A',
    previewColors: ['#FBF9F5', '#EA580C', '#D97706'],
  },

  lavender_light: {
    id: 'lavender_light',
    name: 'Soft Lavender (Light)',
    description: 'Dreamy pastel lavender with rich violet and iris',
    isLight: true,
    background: '#F8F6FF',
    surface: '#FFFFFF',
    surfaceLight: '#EDE8FD',
    surfaceHighlight: '#DDD4FB',
    surfaceBorder: 'rgba(124, 58, 237, 0.1)',
    text: '#1E1B4B',
    textSecondary: '#5B21B6',
    textMuted: '#8B5CF6',

    btnNumberBg: '#FFFFFF',
    btnNumberText: '#1E1B4B',
    btnNumberBorder: 'rgba(124, 58, 237, 0.08)',

    btnActionBg: '#EDE8FD',
    btnActionText: '#5B21B6',
    btnActionBorder: 'rgba(124, 58, 237, 0.12)',

    btnOperatorBg: '#7C3AED',
    btnOperatorPressed: '#6D28D9',
    btnOperatorText: '#FFFFFF',

    btnScientificBg: '#EDE9FE',
    btnScientificText: '#6D28D9',
    btnScientificBorder: 'rgba(109, 40, 217, 0.2)',

    accent: '#7C3AED',
    accentGlow: 'rgba(124, 58, 237, 0.12)',
    danger: '#F43F5E',
    success: '#10B981',
    previewColors: ['#F8F6FF', '#7C3AED', '#6D28D9'],
  },
};
