// import React from "react";
import ReactDOM from "react-dom/client";
import { Map } from "./components/Map/Map";

import "./global.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Map />);
}
