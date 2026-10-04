export type ThemeMode = 'claro' | 'oscuro';

const THEME_STORAGE_KEY = 'APP_THEME_MODE';

export function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'oscuro') return 'oscuro';
    return 'claro'; // Por defecto TEMA CLARO como lo solicita el usuario
  } catch {
    return 'claro';
  }
}

export function applyTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === 'oscuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Error aplicando tema:', e);
  }
}
