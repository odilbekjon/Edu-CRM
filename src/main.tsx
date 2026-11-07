import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { ThemeModeProvider } from './Context/ThemeModeContext';
import { I18nProvider } from './i18n';
import { AuthProvider } from './Context/AuthContext';
import { ToastProvider } from './Context/ToastContext';
import { BranchProvider } from './Context/BranchContext';
import { SidebarProvider } from './Context/SidebarContext';
import { DataProvider } from './Context/DataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <I18nProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <BranchProvider>
                <SidebarProvider>
                  <App />
                </SidebarProvider>
              </BranchProvider>
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
      </I18nProvider>
    </ThemeModeProvider>
  </StrictMode>
)
