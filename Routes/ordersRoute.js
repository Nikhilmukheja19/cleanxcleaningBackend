import express from "express";
import {
  contactMail,
  fetchOrder,
  orderSave,
  sendmail,
} from "../Controller/orderController.js";

const orderrouter = express.Router();

orderrouter.post("/orderSaved", orderSave);
orderrouter.get("/fetchOrder", fetchOrder);
orderrouter.post("/sendmail", sendmail);
orderrouter.post("/getmail", contactMail);

export default orderrouter;
