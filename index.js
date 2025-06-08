import express from "express";
import connectToMongo from "./db.js";
import bodyParser from "body-parser";
import cors from "cors";
import Adminrouter from "./Routes/UserRoutes.js";
import orderrouter from "./Routes/ordersRoute.js";
const app = express();
const PORT = 5000;

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
