// 空文字判定
export function isEmpty(value) {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (typeof value === 'number' && isNaN(value)) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
}

// 配列判定
export function isTypeArray(value) {
  return Array.isArray(value);
}

// 文字列かつ前後の空白を除いた結果が空でないことを判定（空文字・空白のみを拒否）
export function isNonBlankString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// メールアドレス形式判定
export function isValidEmail(value) {
  if (typeof value !== 'string') return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value);
}

// 正の整数のID文字列判定（"0"や"-1"、"1.5"、先頭ゼロ、数値以外の文字列は不可）
export function isValidId(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0;
  }
  if (typeof value !== 'string') return false;
  return /^[1-9]\d*$/.test(value);
}

// メモタイトルの妥当性判定（文字列であること・trim()した結果が空でないこと・100文字以内であること）
// 100文字判定はtrim()前の元の文字列長で行い、保存内容そのものを書き換えることはしない
export function isValidTitle(value) {
  if (typeof value !== 'string') return false;
  if (value.trim().length === 0) return false;
  return value.length <= 100;
}

// メモ本文の妥当性判定（文字列であること・trim()した結果が空でないこと。改行や空白のみは不可）
export function isValidContent(value) {
  if (typeof value !== 'string') return false;
  return value.trim().length > 0;
}
