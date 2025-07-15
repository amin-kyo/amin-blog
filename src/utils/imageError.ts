/**
 * 画像エラーハンドリングユーティリティ
 * 画像読み込み失敗時の代替表示機能
 */

/**
 * 画像読み込みエラー時の代替処理
 * @param event - エラーイベント
 * @param fallbackSrc - 代替画像のパス（オプション）
 */
export function handleImageError(event: Event, fallbackSrc?: string): void {
  const img = event.target as HTMLImageElement;
  
  if (!img) return;
  
  // 既にエラー処理済みの場合は無限ループを防ぐ
  if (img.classList.contains('image-error')) return;
  
  // エラー状態をマーク
  img.classList.add('image-error');
  
  if (fallbackSrc) {
    // 代替画像が指定されている場合
    img.src = fallbackSrc;
    img.alt = img.alt || '画像を読み込めませんでした';
  } else {
    // プレースホルダーを表示
    showImagePlaceholder(img);
  }
}

/**
 * 画像プレースホルダーを表示
 * @param img - 画像要素
 */
function showImagePlaceholder(img: HTMLImageElement): void {
  const wrapper = img.parentElement;
  if (!wrapper) return;
  
  // プレースホルダーコンテナを作成
  const placeholder = document.createElement('div');
  placeholder.className = 'image-placeholder';
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', '画像を読み込めませんでした');
  
  // アイコンとテキストを追加
  placeholder.innerHTML = `
    <div class="image-placeholder-content">
      <svg class="image-placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"/>
      </svg>
      <span class="image-placeholder-text">画像を読み込めませんでした</span>
    </div>
  `;
  
  // 元の画像と置き換え
  wrapper.replaceChild(placeholder, img);
}

/**
 * 画像エラーハンドリングを初期化
 * 既存の画像要素にエラーハンドリングを追加
 */
export function initializeImageErrorHandling(): void {
  if (typeof document === 'undefined') return;
  
  // 既存の画像要素にエラーハンドリングを追加
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('data-error-handled')) {
      img.addEventListener('error', (e) => handleImageError(e));
      img.setAttribute('data-error-handled', 'true');
    }
  });
}

/**
 * 動的に追加された画像要素にエラーハンドリングを追加
 * @param img - 画像要素
 * @param fallbackSrc - 代替画像のパス（オプション）
 */
export function addImageErrorHandling(img: HTMLImageElement, fallbackSrc?: string): void {
  if (img.hasAttribute('data-error-handled')) return;
  
  img.addEventListener('error', (e) => handleImageError(e, fallbackSrc));
  img.setAttribute('data-error-handled', 'true');
}