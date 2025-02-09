import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppContextProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import { theme } from './styles/theme.js';

const AppRoutes = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return isLandingPage ? (
    <LandingPage />
  ) : (
    <Layout />
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContextProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppContextProvider>
    </ThemeProvider>
  );
};

export default App;
