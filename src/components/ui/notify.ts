// Single global handler: only the most recently mounted `ToastProvider`
// receives `notify.*` calls. Mounting more than one `ToastProvider`, or
// unmounting one without another taking its place, silently breaks
// `notify.*` for the rest of the tree — there is no queueing or warning.
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
