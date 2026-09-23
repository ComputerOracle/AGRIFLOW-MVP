/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ID: string
  readonly VITE_USDC_CONTRACT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}