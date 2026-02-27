import type { Config } from 'jest';

const config: Config = {
  maxWorkers: 1,
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@http/(.*)$': '<rootDir>/src/http/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
};

export default config;
