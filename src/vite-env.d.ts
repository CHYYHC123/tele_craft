/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 基础地址（axios baseURL） */
  readonly VITE_API_BASE_URL: string;
  /** 应用标题 */
  readonly VITE_APP_TITLE: string;
  /** Telegram Login 的 Bot Client ID（BotFather → Login Widget，会打进前端包） */
  readonly VITE_TELEGRAM_CLIENT_ID: string;
  /** 是否启用 MSW 接口 mock（仅开发环境生效）：'true' 开启 */
  readonly VITE_ENABLE_MOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
