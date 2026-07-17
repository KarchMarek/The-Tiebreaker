import { createServer as createViteServer } from "vite";

async function startDevServer() {
  const vite = await createViteServer({
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
  });

  await vite.listen();
  console.log("The Tiebreaker Vite development server is running on http://localhost:3000");
}

startDevServer().catch((err) => {
  console.error("Failed to start Vite development server:", err);
  process.exit(1);
});
