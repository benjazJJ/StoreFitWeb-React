
interface ImportMetaEnv {
  readonly VITE_CATALOG_URL: string;
  readonly VITE_ORDERS_URL: string;
  readonly VITE_SUPPORT_URL: string;
  readonly VITE_USERS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}