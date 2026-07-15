import { describe, expect, test } from '@jest/globals';
import {
  isEmpty,
  isValidEmail,
  isValidId,
  isValidTitle,
  isValidContent,
  isNonBlankString,
} from '../ValidationsService.js';

describe('isEmpty', () => {
  test('空文字はtrue', () => {
    expect(isEmpty('')).toBe(true);
  });
  test('undefinedはtrue', () => {
    expect(isEmpty(undefined)).toBe(true);
  });
  test('値がある場合はfalse', () => {
    expect(isEmpty('a')).toBe(false);
  });
});

describe('isValidEmail', () => {
  test('正しい形式のメールアドレスはtrue', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  test('@がない場合はfalse', () => {
    expect(isValidEmail('test.example.com')).toBe(false);
  });
  test('ドメイン部にドットがない場合はfalse', () => {
    expect(isValidEmail('test@example')).toBe(false);
  });
  test('空文字はfalse', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidId', () => {
  test('正の整数の文字列はtrue', () => {
    expect(isValidId('1')).toBe(true);
    expect(isValidId('123')).toBe(true);
  });
  test('0はfalse', () => {
    expect(isValidId('0')).toBe(false);
  });
  test('負の数はfalse', () => {
    expect(isValidId('-1')).toBe(false);
  });
  test('小数はfalse', () => {
    expect(isValidId('1.5')).toBe(false);
  });
  test('数値以外の文字列はfalse', () => {
    expect(isValidId('abc')).toBe(false);
  });
  test('先頭ゼロはfalse', () => {
    expect(isValidId('01')).toBe(false);
  });
});

describe('isValidTitle', () => {
  test('1文字以上100文字以内はtrue', () => {
    expect(isValidTitle('a')).toBe(true);
    expect(isValidTitle('a'.repeat(100))).toBe(true);
  });
  test('空文字はfalse', () => {
    expect(isValidTitle('')).toBe(false);
  });
  test('空白だけはfalse', () => {
    expect(isValidTitle('   ')).toBe(false);
  });
  test('タブ・改行だけはfalse', () => {
    expect(isValidTitle('\t\n  \n')).toBe(false);
  });
  test('前後に空白があっても中身があればtrue', () => {
    expect(isValidTitle('  タイトル  ')).toBe(true);
  });
  test('101文字以上はfalse', () => {
    expect(isValidTitle('a'.repeat(101))).toBe(false);
  });
  test('文字列以外はfalse', () => {
    expect(isValidTitle(123)).toBe(false);
    expect(isValidTitle(null)).toBe(false);
    expect(isValidTitle(undefined)).toBe(false);
    expect(isValidTitle({})).toBe(false);
    expect(isValidTitle(['a'])).toBe(false);
  });
});

describe('isValidContent', () => {
  test('1文字以上はtrue', () => {
    expect(isValidContent('a')).toBe(true);
  });
  test('空文字はfalse', () => {
    expect(isValidContent('')).toBe(false);
  });
  test('空白だけはfalse', () => {
    expect(isValidContent('   ')).toBe(false);
  });
  test('改行だけはfalse', () => {
    expect(isValidContent('\n\n\n')).toBe(false);
  });
  test('前後に空白があっても中身があればtrue', () => {
    expect(isValidContent('  本文  ')).toBe(true);
  });
  test('文字列以外はfalse', () => {
    expect(isValidContent(123)).toBe(false);
    expect(isValidContent(null)).toBe(false);
    expect(isValidContent(undefined)).toBe(false);
    expect(isValidContent({})).toBe(false);
  });
});

describe('isNonBlankString', () => {
  test('通常の文字列はtrue', () => {
    expect(isNonBlankString('a')).toBe(true);
  });
  test('空文字はfalse', () => {
    expect(isNonBlankString('')).toBe(false);
  });
  test('空白だけはfalse', () => {
    expect(isNonBlankString('   ')).toBe(false);
  });
  test('文字列以外はfalse', () => {
    expect(isNonBlankString(undefined)).toBe(false);
    expect(isNonBlankString(null)).toBe(false);
    expect(isNonBlankString(123)).toBe(false);
  });
});
