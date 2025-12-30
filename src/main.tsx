import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter} from "react-router-dom";
import AppRoutes from "./routes/AppRoutes"
import "./index.css"
import { store }from './app/store';
import { Provider } from 'react-redux'

const root = document.getElementById("root"); 

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
