import App from "./src/App";
import { createRoot } from "react-dom/client";
import { ThemeEditor } from "./src/style/ThemeEditor";
import { ModesProvider } from "./src/lib/stellaModes";
import "./src/style/theme.css";


const root = createRoot(document.getElementById("root")!);
root.render(
  <ModesProvider>
    <App />
    <ThemeEditor />
  </ModesProvider>
);