import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ConfigRoutes from "./routes";
import "./App.css";
import "./utils/suppressWarnings";

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <Router>
        <ConfigRoutes />
      </Router>
    </React.StrictMode>
  );
};

export default App;
