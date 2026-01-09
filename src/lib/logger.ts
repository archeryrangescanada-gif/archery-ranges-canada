export const logger = {
  error: (message: string, meta?: any) => {
    console.error(message, meta)
    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(new Error(message), { extra: meta })
    }
  },
  warn: (message: string, meta?: any) => {
    console.warn(message, meta)
  },
  info: (message: string, meta?: any) => {
    console.info(message, meta)
  },
}
