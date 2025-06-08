import express from "express";
import { fetchOrder, orderSave } from "../Controller/orderController.js";

const orderrouter = express.Router();

orderrouter.post("/orderSaved", orderSave);
orderrouter.get("/fetchOrder", fetchOrder);

export default orderrouter;
