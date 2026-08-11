import { env, resolveCorsOrigins } from "@elmry/config";
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: resolveCorsOrigins(),
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);

app.get("/", (_req, res) => {
  res.json({
    message: "ERP Backend Running 🚀",
    env: env.NODE_ENV,
  });
});

export default app;
