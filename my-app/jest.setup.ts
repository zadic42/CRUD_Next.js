// jest.setup.ts
import '@testing-library/jest-dom';

// TypeScript configuration for tests
interface Global {
  __TEST__: boolean;
}

declare global {
  var __TEST__: boolean;
}

global.__TEST__ = true;
