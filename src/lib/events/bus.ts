type Handler<T> = (payload: T) => void;

const handlers = new Map<string, Set<Handler<unknown>>>();

export function emit<T = unknown>(event: string, payload: T): void {
  handlers.get(event)?.forEach((handler) => handler(payload));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }
}

export function on<T = unknown>(event: string, handler: Handler<T>): () => void {
  const current = handlers.get(event) ?? new Set<Handler<unknown>>();
  current.add(handler as Handler<unknown>);
  handlers.set(event, current);
  return () => {
    current.delete(handler as Handler<unknown>);
    if (current.size === 0) handlers.delete(event);
  };
}

export function once<T = unknown>(event: string, handler: Handler<T>): () => void {
  let unsubscribe = () => undefined;
  unsubscribe = on<T>(event, (payload) => {
    unsubscribe();
    handler(payload);
  });
  return unsubscribe;
}

export function clearEventBus(): void {
  handlers.clear();
}
