/**
 * テーマ管理機能
 * ダークモード・ライトモードの切り替えとLocalStorageでの永続化
 */

import { safeLocalStorage, safeMediaQuery, logError } from './errorHandler';

export type Theme = 'light' | 'dark';

/**
 * 現在のテーマを取得
 */
export function getCurrentTheme(): Theme {
  const stored = safeLocalStorage('theme');
  if (stored && (stored === 'light' || stored === 'dark')) {
    return stored as Theme;
  }
  
  // システムの設定を確認
  if (typeof window !== 'undefined' && window.matchMedia) {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (error) {
      logError('warn', 'Failed to check system theme preference', error as Error);
    }
  }
  
  return 'light';
}

/**
 * テーマを設定
 */
export function setTheme(theme: Theme): void {
  try {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    safeLocalStorage('theme', theme, 'set');
  } catch (error) {
    logError('error', 'Failed to set theme', error as Error, { theme });
  }
}

/**
 * テーマを切り替え
 */
export function toggleTheme(): void {
  try {
    const currentTheme = getCurrentTheme();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  } catch (error) {
    logError('error', 'Failed to toggle theme', error as Error);
  }
}

/**
 * テーマ初期化（SSR対応）
 */
export function initializeTheme(): void {
  try {
    const theme = getCurrentTheme();
    setTheme(theme);
  } catch (error) {
    logError('error', 'Failed to initialize theme', error as Error);
  }
}

/**
 * システムの設定変更を監視
 */
export function watchSystemTheme(): (() => void) | void {
  return safeMediaQuery('(prefers-color-scheme: dark)', (matches) => {
    // LocalStorageに保存されている場合はシステム設定を無視
    const stored = safeLocalStorage('theme');
    if (stored) {
      return;
    }
    
    const newTheme: Theme = matches ? 'dark' : 'light';
    setTheme(newTheme);
  });
}