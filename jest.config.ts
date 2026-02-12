// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/test/setup/global-setup.ts',
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
};

export default config;
