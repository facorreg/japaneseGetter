import dotenv from 'dotenv';

dotenv.config();

const getEnv = (envName, defaultValue) => (
  process.env[envName] || defaultValue
);

export default getEnv;
