/**
 * エラーハンドリングユーティリティ
 * 基本的なtry-catch処理とエラーログ機能
 */

export type ErrorLevel = 'error' | 'warn' | 'info';

export interface ErrorLogEntry {
  timestamp: Date;
  level: ErrorLevel;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

/**
 * エラーログを記録
 * @param level - エラーレベル
 * @param message - エラーメッセージ
 * @param error - エラーオブジェクト
 * @param context - 追加のコンテキスト情報
 */
export function logError(
  level: ErrorLevel,
  message: string,
  error?: Error,
  context?: Record<string, any>
): void {
  const logEntry: ErrorLogEntry = {
    timestamp: new Date(),
    level,
    message,
    stack: error?.stack,
    context
  };

  // コンソールに出力
  const consoleMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
  consoleMethod(`[${level.toUpperCase()}] ${message}`, error || '', context || '');

  // 本番環境では外部ログサービスに送信する場合はここに実装
  // 例: Sentry, LogRocket, DataDog など
}

/**
 * 非同期関数を安全に実行
 * @param fn - 実行する非同期関数
 * @param errorMessage - エラー時のメッセージ
 * @param fallbackValue - エラー時の代替値
 * @returns 結果またはfallbackValue
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Async operation failed',
  fallbackValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    logError('error', errorMessage, error as Error);
    return fallbackValue;
  }
}

/**
 * 同期関数を安全に実行
 * @param fn - 実行する同期関数
 * @param errorMessage - エラー時のメッセージ
 * @param fallbackValue - エラー時の代替値
 * @returns 結果またはfallbackValue
 */
export function safeSync<T>(
  fn: () => T,
  errorMessage: string = 'Sync operation failed',
  fallbackValue?: T
): T | undefined {
  try {
    return fn();
  } catch (error) {
    logError('error', errorMessage, error as Error);
    return fallbackValue;
  }
}

/**
 * LocalStorage操作を安全に実行
 * @param key - キー
 * @param value - 値（取得の場合は省略）
 * @param operation - 操作タイプ
 * @returns 取得した値またはundefined
 */
export function safeLocalStorage(
  key: string,
  value?: string,
  operation: 'get' | 'set' | 'remove' = 'get'
): string | undefined {
  if (typeof localStorage === 'undefined') {
    logError('warn', 'LocalStorage not available', undefined, { key, operation });
    return undefined;
  }

  try {
    switch (operation) {
      case 'get':
        return localStorage.getItem(key) || undefined;
      case 'set':
        if (value !== undefined) {
          localStorage.setItem(key, value);
        }
        return value;
      case 'remove':
        localStorage.removeItem(key);
        return undefined;
      default:
        return undefined;
    }
  } catch (error) {
    logError('error', `LocalStorage ${operation} failed`, error as Error, { key, value });
    return undefined;
  }
}

/**
 * DOM操作を安全に実行
 * @param selector - セレクタ
 * @param operation - 実行する操作
 * @param errorMessage - エラー時のメッセージ
 * @returns 操作の結果
 */
export function safeDOMOperation<T>(
  selector: string,
  operation: (element: Element) => T,
  errorMessage: string = 'DOM operation failed'
): T | undefined {
  if (typeof document === 'undefined') {
    logError('warn', 'Document not available', undefined, { selector });
    return undefined;
  }

  try {
    const element = document.querySelector(selector);
    if (!element) {
      logError('warn', `Element not found: ${selector}`);
      return undefined;
    }
    return operation(element);
  } catch (error) {
    logError('error', errorMessage, error as Error, { selector });
    return undefined;
  }
}

/**
 * メディアクエリを安全に監視
 * @param query - メディアクエリ
 * @param callback - コールバック関数
 * @returns クリーンアップ関数
 */
export function safeMediaQuery(
  query: string,
  callback: (matches: boolean) => void
): (() => void) | undefined {
  if (typeof window === 'undefined' || !window.matchMedia) {
    logError('warn', 'matchMedia not available', undefined, { query });
    return undefined;
  }

  try {
    const mediaQuery = window.matchMedia(query);
    
    const handleChange = (e: MediaQueryListEvent) => {
      try {
        callback(e.matches);
      } catch (error) {
        logError('error', 'MediaQuery callback failed', error as Error, { query });
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // 初期値を設定
    try {
      callback(mediaQuery.matches);
    } catch (error) {
      logError('error', 'MediaQuery initial callback failed', error as Error, { query });
    }

    return () => {
      try {
        mediaQuery.removeEventListener('change', handleChange);
      } catch (error) {
        logError('error', 'MediaQuery cleanup failed', error as Error, { query });
      }
    };
  } catch (error) {
    logError('error', 'MediaQuery setup failed', error as Error, { query });
    return undefined;
  }
}

/**
 * 未処理のエラーをキャッチ
 */
export function setupGlobalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // JavaScript エラー
  window.addEventListener('error', (event) => {
    logError('error', 'Unhandled JavaScript error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    logError('error', 'Unhandled Promise rejection', new Error(String(event.reason)), {
      reason: event.reason
    });
  });
}