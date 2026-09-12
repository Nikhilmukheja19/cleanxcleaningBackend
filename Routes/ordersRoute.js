import express from "express";
import {
  contactMail,
  fetchOrder,
  orderSave,
  sendmail,
  updateOrderStatus,
} from "../Controller/orderController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";

const orderrouter = express.Router();

orderrouter.post("/orderSaved", orderSave);
orderrouter.get("/fetchOrder", authMiddleware, fetchOrder);
orderrouter.post("/sendmail", sendmail);
orderrouter.post("/getmail", contactMail);
orderrouter.patch("/orderUpdatemail/:orderId", authMiddleware, updateOrderStatus);

export default orderrouter;
