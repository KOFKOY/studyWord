export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number): T {
  let timer: number | undefined;
  return function debounced(this: unknown, ...args: never[]) {
    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  } as T;
}
