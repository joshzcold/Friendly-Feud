type AnyFunction = (...args: any[]) => any;

export function debounce<T extends AnyFunction>(callback: T, wait = 400): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(function (this: unknown) {
      callback.apply(this, args);
    }, wait);
  };
}
