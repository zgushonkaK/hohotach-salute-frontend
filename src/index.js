import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App.jsx';
import reportWebVitals from './reportWebVitals';
import './App.css';

import { DeviceThemeProvider, SSRProvider } from '@salutejs/plasma-ui';
import { detectDevice } from '@salutejs/plasma-ui/utils';

const rootElement = document.getElementById('root');

const detectDeviceCallback = () => detectDevice();

ReactDOM.createRoot(rootElement).render(
    <DeviceThemeProvider detectDeviceCallback={() => "sberBox"} responsiveTypo={true}>
        <SSRProvider>
            <App />
        </SSRProvider>
    </DeviceThemeProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();