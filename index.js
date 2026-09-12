import express from "express";
import connectToMongo from "./db.js";
import bodyParser from "body-parser";
import cors from "cors";
import Adminrouter from "./Routes/UserRoutes.js";
import orderrouter from "./Routes/ordersRoute.js";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing or too short. Add a random value of at least 32 characters to cleanxcleaningBackend/.env."
  );
}

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

connectToMongo();

app.use("/auth", Adminrouter);
app.use("/order", orderrouter);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "canex-cleaning-api" });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
