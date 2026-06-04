import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./style.css";

const root = document.getElementById("app");
if (root) {
  createRoot(root).render(createElement(App));
}
