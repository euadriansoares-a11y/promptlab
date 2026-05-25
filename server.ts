import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { webhookCakto } from "./cakto-webhook";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware para processar o body do webhook
  app.use(express.json());

  // Rota do Webhook da Cakto
  app.post("/webhook/cakto", webhookCakto);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
