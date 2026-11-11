/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 基础地址（axios baseURL） */
  readonly VITE_API_BASE_URL: string;
  /** 应用标题 */
  readonly VITE_APP_TITLE: string;
  /** Telegram Login 的 Bot Client ID（BotFather → Login Widget，会打进前端包） */
  readonly VITE_TELEGRAM_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
