import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { useThemeStore } from './store/uiStore';

function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme]);

  return <AppRoutes />;
}

export default App;
