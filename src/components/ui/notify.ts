let handler: ((message: string, type: string, duration?: number) => void) | undefined;

export const notify = {
  info: (message: string, duration?: number) => handler?.(message, "info", duration),
  success: (message: string, duration?: number) => handler?.(message, "success", duration),
  warn: (message: string, duration?: number) => handler?.(message, "warn", duration),
  error: (message: string, duration?: number) => handler?.(message, "error", duration),
}

export function registerNotify(fn: (message: string, type: string, duration?: number) => void) {
  handler = fn
}
