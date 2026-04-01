import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { ResetPassword } from './components/ResetPassword.tsx';
import './index.css';

const pathname = window.location.pathname;
const isAdmin = pathname === '/admin';
const isResetPassword = pathname === '/reset-password';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isResetPassword ? <ResetPassword /> : isAdmin ? <AdminDashboard /> : <App />}
  </StrictMode>,
);
