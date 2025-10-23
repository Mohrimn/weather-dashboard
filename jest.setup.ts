// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.indexedDB = {
  open: jest.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    result: {
      createObjectStore: jest.fn(() => ({
        createIndex: jest.fn(),
      })),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          add: jest.fn(),
          delete: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          openCursor: jest.fn(() => ({
            onsuccess: null,
          })),
        })),
        oncomplete: null,
        onerror: null,
      })),
    },
  })),
  deleteDatabase: jest.fn(),
};


