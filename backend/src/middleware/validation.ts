import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorHandler';

// 유효성 검사 미들웨어
export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // 요청 본문 검증
    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // 쿼리 파라미터 검증
    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    // 경로 파라미터 검증
    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      throw createError.badRequest(`입력값 검증 실패: ${errors.join('; ')}`, 'VALIDATION_ERROR');
    }

    next();
  };
};

// 공통 스키마 정의
export const commonSchemas = {
  // ID 검증
  id: Joi.string().required().min(1).messages({
    'string.empty': 'ID는 필수입니다',
    'any.required': 'ID는 필수입니다',
  }),

  // 이메일 검증
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요',
    'any.required': '이메일은 필수입니다',
  }),

  // 비밀번호 검증
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required().messages({
    'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
    'string.pattern.base': '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다',
    'any.required': '비밀번호는 필수입니다',
  }),

  // 이름 검증
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': '이름은 최소 2자 이상이어야 합니다',
    'string.max': '이름은 최대 50자까지 가능합니다',
    'any.required': '이름은 필수입니다',
  }),

  // 전화번호 검증
  phone: Joi.string().pattern(new RegExp('^01[0-9]-?[0-9]{4}-?[0-9]{4}$')).messages({
    'string.pattern.base': '유효한 전화번호 형식을 입력해주세요 (예: 010-1234-5678)',
  }),

  // 페이지네이션
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

// 설문 관련 스키마
export const surveySchemas = {
  // 기본 정보 스키마
  basicInfo: Joi.object({
    age: Joi.string().valid('10대', '20대', '30대', '40대', '50대', '60대 이상').required(),
    education: Joi.string().valid('중학교 졸업', '고등학교 졸업', '전문대학 졸업', '대학교 졸업', '대학원 졸업').required(),
    experience: Joi.string().valid('없음', '1년 미만', '1-3년', '3-5년', '5-10년', '10년 이상').required(),
    location: Joi.string().optional(),
  }),

  // 관심사 스키마
  interests: Joi.object({
    interests: Joi.array().items(Joi.string()).min(1).max(5).required(),
    preferredIndustries: Joi.array().items(Joi.string()).optional(),
    workEnvironment: Joi.string().valid('office', 'remote', 'hybrid', 'field', 'travel').required(),
  }),

  // 강점 스키마
  strengths: Joi.object({
    skills: Joi.array().items(Joi.string()).min(1).max(8).required(),
    achievements: Joi.array().items(Joi.string()).optional(),
    workStyle: Joi.string().valid('independent', 'collaborative', 'detail_oriented', 'big_picture', 'innovative', 'systematic').required(),
  }),

  // 성격 스키마
  personality: Joi.object({
    personality: Joi.object({
      extroversion: Joi.number().integer().min(1).max(5).required(),
      conscientiousness: Joi.number().integer().min(1).max(5).required(),
      openness: Joi.number().integer().min(1).max(5).required(),
      agreeableness: Joi.number().integer().min(1).max(5).required(),
      neuroticism: Joi.number().integer().min(1).max(5).required(),
    }).required(),
    problemSolvingStyle: Joi.string().valid('analytical', 'creative', 'practical', 'collaborative', 'intuitive').required(),
    communicationStyle: Joi.string().valid('direct', 'diplomatic', 'enthusiastic', 'supportive', 'analytical_comm').required(),
  }),

  // 전체 설문 스키마
  completeSurvey: Joi.object({
    basicInfo: Joi.object().required(),
    interests: Joi.object().required(),
    strengths: Joi.object().required(),
    personality: Joi.object().required(),
  }),
};

// 인증 관련 스키마
export const authSchemas = {
  // 회원가입
  register: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    name: commonSchemas.name,
    phone: commonSchemas.phone.optional(),
    referralCode: Joi.string().optional(),
  }),

  // 로그인
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required().messages({
      'any.required': '비밀번호는 필수입니다',
    }),
  }),

  // 비밀번호 재설정 요청
  resetPasswordRequest: Joi.object({
    email: commonSchemas.email,
  }),

  // 비밀번호 재설정
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: commonSchemas.password,
  }),
};

// 사용자 관련 스키마
export const userSchemas = {
  // 프로필 업데이트
  updateProfile: Joi.object({
    name: commonSchemas.name.optional(),
    phone: commonSchemas.phone.optional(),
    birthYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY').optional(),
  }),

  // 비밀번호 변경
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password,
  }),
};