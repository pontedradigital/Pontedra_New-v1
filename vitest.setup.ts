import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
expect.extend(matchers)

class IO {
  callback: IntersectionObserverCallback
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb
  }
  observe() {
    this.callback([], this as unknown as IntersectionObserver)
  }
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
  root = null
  rootMargin = ''
  thresholds = []
}
// @ts-expect-error: jsdom não possui IntersectionObserver nativamente
globalThis.IntersectionObserver = IO as unknown as typeof IntersectionObserver

if (typeof globalThis.matchMedia !== 'function') {
  // @ts-expect-error: fornecendo stub para matchMedia em ambiente de teste
  globalThis.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error: fornecendo stub para ResizeObserver em ambiente de teste
globalThis.ResizeObserver = RO as unknown as typeof ResizeObserver
