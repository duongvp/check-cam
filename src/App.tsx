import { routes } from './routes/routes';
import { useRoutes } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';

const App = () => {
  console.log("routes", routes);
  const children = useRoutes(routes);
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {children}
    </ThemeProvider>
  );
}

export default App;
