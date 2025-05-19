export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      configFile: './jest.babel.config.js',
    }],
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/' , '/tests/e2e/', '/playwright-tests/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(@apollo|graphql)/)',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
} as Record<string, any>;
