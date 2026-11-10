import { lazy, type ComponentType } from 'react';

/**
 * 🛡️ Envoltorio para React.lazy con auto-recarga inteligente en caso de fallo de fragmento (stale chunk)
 * Previene pantallas blancas cuando se despliega una nueva versión de la app.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | any>
) {
  return lazy(async () => {
    const pageKey = 'sfa_chunk_retry_' + window.location.pathname;
    const hasAlreadyRefreshed = sessionStorage.getItem(pageKey);

    try {
      const component = await componentImport();
      sessionStorage.removeItem(pageKey);
      return component.default ? component : { default: component };
    } catch (error) {
      if (!hasAlreadyRefreshed) {
        sessionStorage.setItem(pageKey, 'true');
        window.location.reload();
      }
      throw error;
    }
  });
}
