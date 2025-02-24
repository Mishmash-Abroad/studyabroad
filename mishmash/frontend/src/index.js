import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: "https://373510ff6656d657af5f7ee9f4551775@o4508874878812161.ingest.us.sentry.io/4508874947035136",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  tracePropagationTargets: [
    "localhost:3000", // Local frontend
    "localhost:8000", // Local backend
    /^https:\/\/dev-mishmash\.colab\.duke\.edu\//, // Dev frontend + backend
    /^https:\/\/test-mishmash\.colab\.duke\.edu\//, // Test frontend + backend
    /^https:\/\/mishmash\.colab\.duke\.edu\// // Production frontend + backend
  ],
  replaysSessionSampleRate: 0.1, // 10% session sampling
  replaysOnErrorSampleRate: 1.0, // 100% sampling for sessions with errors
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// Measure web vitals for performance monitoring
reportWebVitals();
