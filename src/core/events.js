const channels = new Map();

export function on(name, handler) {
  if (!channels.has(name)) channels.set(name, new Set());
  channels.get(name).add(handler);
  return () => off(name, handler);
}

export function off(name, handler) {
  channels.get(name)?.delete(handler);
}

export function emit(name, payload) {
  channels.get(name)?.forEach((handler) => {
    try {
      handler(payload);
    } catch (err) {
      console.error(`[events] handler failed for "${name}"`, err);
    }
  });
}
