/**
 * Types for custom import.meta.env variables that Quasar CLI doesn't
 * add automatically.
 */
interface ImportMetaEnv {
  /** Backend base URL. Exposed to the client via build.env.clientPrefix in quasar.config.ts. */
  readonly VITE_API_URL?: string;
}
