import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/lib/i18n';
import { useAnalytics } from '@/hooks/useAnalytics';
import { getRouter } from './router';
import './styles.css';

const router = getRouter();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useAnalytics();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors />
      </I18nProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
