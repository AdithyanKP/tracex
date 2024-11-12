import express from "express";
import pkg from "body-parser";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import cors from "cors";

const app = express();
const { json, urlencoded } = pkg;
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/file", fileRoutes);

export default app;
