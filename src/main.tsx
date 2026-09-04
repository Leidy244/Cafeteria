import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ToastProvider, CashRegisterProvider } from './contexts';
import { ToastContainer } from './components/ToastContainer';
import App from './App';
import './styles/toast.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CashRegisterProvider>
            <ToastContainer />
            <App />
          </CashRegisterProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
