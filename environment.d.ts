declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GTHUB_WORKSPACE: string
    }
  }
}
