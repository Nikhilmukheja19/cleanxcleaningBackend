import express from "express";
import {
  contactMail,
  fetchOrder,
  orderSave,
  sendmail,
  updateOrderStatus,
} from "../Controller/orderController.js";

const orderrouter = express.Router();

orderrouter.post("/orderSaved", orderSave);
orderrouter.get("/fetchOrder", fetchOrder);
orderrouter.post("/sendmail", sendmail);
orderrouter.post("/getmail", contactMail);
orderrouter.post("/orderUpdatemail/:orderId", updateOrderStatus);

export default orderrouter;
