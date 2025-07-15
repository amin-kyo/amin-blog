/**
 * テーマ管理機能
 * ダークモード・ライトモードの切り替えとLocalStorageでの永続化
 */

export type Theme = 'light' | 'dark';

/**
 * 現在のテーマを取得
 */
export function getCurrentTheme(): Theme {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) return stored;
  }
  
  // システムの設定を確認
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  return 'light';
}

/**
 * テーマを設定
 */
export function setTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', theme);
  }
}

/**
 * テーマを切り替え
 */
export function toggleTheme(): void {
  const currentTheme = getCurrentTheme();
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

/**
 * テーマ初期化（SSR対応）
 */
export function initializeTheme(): void {
  const theme = getCurrentTheme();
  setTheme(theme);
}

/**
 * システムの設定変更を監視
 */
export function watchSystemTheme(): (() => void) | void {
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // LocalStorageに保存されている場合はシステム設定を無視
      if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
        return;
      }
      
      const newTheme: Theme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // クリーンアップ関数を返す
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
}