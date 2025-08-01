import crypto from 'crypto';
import { config } from '../config/environment';

const ALGORITHM = config.ENCRYPTION_ALGORITHM;
const SECRET_KEY = config.ENCRYPTION_KEY;

// 데이터 암호화
export const encryptData = (data: any): any => {
  try {
    const text = JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, SECRET_KEY);
    cipher.setAutoPadding(true);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag ? cipher.getAuthTag() : Buffer.alloc(0);
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex'),
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('데이터 암호화에 실패했습니다.');
  }
};

// 데이터 복호화
export const decryptData = (encryptedObj: any): any => {
  try {
    const { iv, encryptedData, authTag } = encryptedObj;
    const decipher = crypto.createDecipher(ALGORITHM, SECRET_KEY);
    
    if (authTag && decipher.setAuthTag) {
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    }
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('데이터 복호화에 실패했습니다.');
  }
};

// 비밀번호 해싱
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// 비밀번호 검증
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hashedPassword);
};

// JWT 토큰 생성
export const generateTokens = (userId: string) => {
  const jwt = require('jsonwebtoken');
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
  );
  
  return { accessToken, refreshToken };
};

// 랜덤 코드 생성 (추천인 코드 등)
export const generateRandomCode = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// 이메일 마스킹
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  const maskedLocal = localPart.substring(0, 2) + '*'.repeat(localPart.length - 2);
  return `${maskedLocal}@${domain}`;
};

// 전화번호 마스킹
export const maskPhone = (phone: string): string => {
  return phone.replace(/(\d{3})-?(\d{2})\d{2}-?(\d{4})/, '$1-$2**-$3');
};

// 안전한 데이터 로깅을 위한 민감정보 제거
export const sanitizeForLogging = (data: any): any => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'email', 'phone'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      sanitized[key] = typeof value === 'string' ? '*'.repeat(value.length) : '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};