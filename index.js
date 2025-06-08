import express from "express";
import connectToMongo from "./db.js";
import bodyParser from "body-parser";
import cors from "cors";
import Adminrouter from "./Routes/UserRoutes.js";
import orderrouter from "./Routes/ordersRoute.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

connectToMongo();

app.use("/auth", Adminrouter);
app.use("/order", orderrouter);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
