import dotenv from 'dotenv';

dotenv.config();

interface Environment {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  CORS_ORIGIN: string;
  SESSION_SECRET: string;
  SESSION_MAX_AGE: number;
  COUNTRY_CODE: string;
  COUNTRY_TIMEZONE: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  
  return value;
};

const env: Environment = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  MONGODB_URI: getEnvVariable(
    'MONGODB_URI',
    'mongodb://admin:devpassword123@mongodb:27017/hackathon?authSource=admin'
  ),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', '*'),
  SESSION_SECRET: getEnvVariable('SESSION_SECRET', 'dev-session-secret-change-in-production'),
  SESSION_MAX_AGE: parseInt(getEnvVariable('SESSION_MAX_AGE', '86400000'), 10),
  COUNTRY_CODE: getEnvVariable('COUNTRY_CODE', 'RW'),
  COUNTRY_TIMEZONE: getEnvVariable('COUNTRY_TIMEZONE', 'Africa/Kigali')
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

export default env;
