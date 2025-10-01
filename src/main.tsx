import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DataProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </DataProvider>
  </React.StrictMode>
);
