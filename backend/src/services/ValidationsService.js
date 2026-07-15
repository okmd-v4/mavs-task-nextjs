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

// メモタイトルの妥当性判定（必須・100文字以内）
export function isValidTitle(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 100;
}

// メモ本文の妥当性判定（必須）
export function isValidContent(value) {
  return typeof value === 'string' && value.length > 0;
}
