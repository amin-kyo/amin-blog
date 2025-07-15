/**
 * コンテンツエラーハンドリング
 * ブログ記事やコンテンツの読み込みエラーに対する処理
 */

import { logError } from './errorHandler';

export interface ContentError {
  type: 'not-found' | 'parse-error' | 'invalid-data' | 'network-error';
  message: string;
  slug?: string;
  context?: Record<string, any>;
}

/**
 * コンテンツエラーを安全に処理
 * @param error - エラー情報
 * @param fallbackContent - 代替コンテンツ
 * @returns 代替コンテンツまたはundefined
 */
export function handleContentError<T>(
  error: ContentError,
  fallbackContent?: T
): T | undefined {
  logError('error', `Content error: ${error.message}`, undefined, {
    type: error.type,
    slug: error.slug,
    context: error.context
  });

  // エラータイプに応じた処理
  switch (error.type) {
    case 'not-found':
      // 404エラーの場合は代替コンテンツを返す
      return fallbackContent;
    
    case 'parse-error':
      // パースエラーの場合はログを記録して代替コンテンツを返す
      logError('warn', 'Content parse error, using fallback', undefined, { slug: error.slug });
      return fallbackContent;
    
    case 'invalid-data':
      // 無効なデータの場合は代替コンテンツを返す
      return fallbackContent;
    
    case 'network-error':
      // ネットワークエラーの場合は代替コンテンツを返す
      logError('warn', 'Network error, using fallback', undefined, { slug: error.slug });
      return fallbackContent;
    
    default:
      return fallbackContent;
  }
}

/**
 * ブログ記事の読み込みを安全に実行
 * @param loader - 記事読み込み関数
 * @param slug - 記事のスラッグ
 * @returns 記事データまたはundefined
 */
export async function safeLoadBlogPost<T>(
  loader: () => Promise<T>,
  slug: string
): Promise<T | undefined> {
  try {
    return await loader();
  } catch (error) {
    const contentError: ContentError = {
      type: 'not-found',
      message: `Failed to load blog post: ${slug}`,
      slug,
      context: { error: (error as Error).message }
    };
    
    return handleContentError(contentError);
  }
}

/**
 * コンテンツコレクションの読み込みを安全に実行
 * @param loader - コレクション読み込み関数
 * @param collectionName - コレクション名
 * @returns コレクションデータまたは空配列
 */
export async function safeLoadCollection<T>(
  loader: () => Promise<T[]>,
  collectionName: string
): Promise<T[]> {
  try {
    return await loader();
  } catch (error) {
    const contentError: ContentError = {
      type: 'network-error',
      message: `Failed to load collection: ${collectionName}`,
      context: { error: (error as Error).message }
    };
    
    return handleContentError(contentError, []) || [];
  }
}

/**
 * MDXファイルの読み込みを安全に実行
 * @param loader - MDX読み込み関数
 * @param filePath - ファイルパス
 * @returns MDXデータまたはundefined
 */
export async function safeLoadMDX<T>(
  loader: () => Promise<T>,
  filePath: string
): Promise<T | undefined> {
  try {
    return await loader();
  } catch (error) {
    const contentError: ContentError = {
      type: 'parse-error',
      message: `Failed to parse MDX file: ${filePath}`,
      context: { filePath, error: (error as Error).message }
    };
    
    return handleContentError(contentError);
  }
}

/**
 * タグデータの検証と修正
 * @param tags - タグ配列
 * @returns 検証済みタグ配列
 */
export function validateTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    logError('warn', 'Tags is not an array', undefined, { tags });
    return [];
  }
  
  const validTags = tags.filter(tag => {
    if (typeof tag !== 'string') {
      logError('warn', 'Invalid tag type', undefined, { tag, type: typeof tag });
      return false;
    }
    
    if (tag.trim() === '') {
      logError('warn', 'Empty tag found', undefined, { tag });
      return false;
    }
    
    return true;
  });
  
  return validTags as string[];
}

/**
 * 日付データの検証と修正
 * @param date - 日付データ
 * @param fallbackDate - 代替日付
 * @returns 検証済み日付
 */
export function validateDate(date: unknown, fallbackDate: Date = new Date()): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }
  
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  
  logError('warn', 'Invalid date format', undefined, { date, fallback: fallbackDate });
  return fallbackDate;
}

/**
 * 記事データの検証
 * @param data - 記事データ
 * @returns 検証済み記事データ
 */
export function validatePostData(data: any): {
  title: string;
  description: string;
  publishDate: Date;
  tags: string[];
  draft: boolean;
} {
  const validated = {
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    description: typeof data.description === 'string' ? data.description : '',
    publishDate: validateDate(data.publishDate),
    tags: validateTags(data.tags),
    draft: typeof data.draft === 'boolean' ? data.draft : false
  };
  
  if (data.title !== validated.title) {
    logError('warn', 'Invalid title, using fallback', undefined, { original: data.title });
  }
  
  if (data.description !== validated.description) {
    logError('warn', 'Invalid description, using fallback', undefined, { original: data.description });
  }
  
  return validated;
}