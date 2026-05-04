export function register() {
  if (typeof window === 'undefined') {
    // Polyfill localStorage for the server to prevent crashes
    // but only if it's not already defined or if it's broken
    if (typeof global !== 'undefined' && (!global.localStorage || typeof global.localStorage.getItem !== 'function')) {
      (global as any).localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0
      };
    }
  }
}
