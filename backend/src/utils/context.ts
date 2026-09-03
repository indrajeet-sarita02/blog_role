import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}

export const requestStorage = new AsyncLocalStorage<RequestContext>();

export function getRequestContext(): RequestContext {
  return requestStorage.getStore() ?? {};
}