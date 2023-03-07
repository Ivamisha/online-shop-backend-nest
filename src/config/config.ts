import 'dotenv/config';
import { isPropertyAccessChain } from 'typescript';

export default {
  urlDB: process.env.MONGO_URL,
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtAcces: process.env.JWT_ACCESS_SECRET,
  jwtRefresh: process.env.JWT_REFRES_SECRET,
  accessTokenValidity: '1h',
  refreshTokenValidity: '14d',
  passportSecret: process.env.PASSPORT_SECRET,
  HASH_ROUDS: 10,
  categoryLimit: 99,
  limitFindProduct: 20,
  initialPage: 0,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  HOST_URL: process.env.CONFIRM_URL,
  IMAGE_URL: process.env.IMAGE_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  RESTORE_URL: process.env.RESTORE_URL,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  acesUserToken: {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  },
  refreshUserToken: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
  acesAdminToken: {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  },
  refreshAdminToken: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

export interface ConfigI {
  refreshAdminToken: {
    maxAge: number;
    httpOnly: boolean;
  };
  acesAdminToken: {
    maxAge: number;
    httpOnly: boolean;
  };
  refreshUserToken: {
    maxAge: number;
    httpOnly: boolean;
  };
  acesUserToken: {
    maxAge: number;
    httpOnly: boolean;
  };
  jwtAcces: string;
  jwtRefresh: string;
  HASH_ROUDS: number;
  categoryLimit: number;
  initialPage: number;
  passportSecret: string;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  accessTokenValidity: string;
  refreshTokenValidity: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  CONFIRM_URL: string;
  IMAGE_URL: string;
  CLIENT_URL: string;
  RESTORE_URL: string;
  limitFindProduct: number;
  AWS_BUCKET_NAME: string;
  AWS_ACCESS_KEY: string;
  AWS_SECRET_ACCESS_KEY: string;
}
