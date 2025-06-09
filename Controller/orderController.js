import nodemailer from "nodemailer";

import OrderModel from "../Models/OrderModel.js";
import dotenv from "dotenv";

dotenv.config();

export const orderSave = async (req, res) => {
  const generateOrderId = () => Math.floor(1000 + Math.random() * 9000);
  try {
    const { fullName, email, phone, dateTime, street, city, state, zip } =
      req.body;
    console.log(req.body);
    const parsedDate = new Date(dateTime);
    if (
      !fullName ||
      !email ||
      !phone ||
      !dateTime ||
      !street ||
      !city ||
      !state ||
      !zip
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newOrder = new OrderModel({
      orderId: generateOrderId(),
      fullName,
      email,
      phone,
      dateTime: parsedDate,
      street,
      city,
      state,
      zip,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();
    console.log(savedOrder);

    // Format the response
    const response = {
      orderId: savedOrder.orderId,
      client: {
        fullName: savedOrder.fullName,
        phone: savedOrder.phone,
        email: savedOrder.email,
      },
      dateTime: parsedDate.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      address: {
        street: savedOrder.street,
        city: savedOrder.city,
        state: savedOrder.state,
        zip: savedOrder.zip,
      },
      status: savedOrder.status,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Server error saving order" });
  }
};

export const fetchOrder = async (req, res) => {
  try {
    const allOrders = await OrderModel.find({}).sort({ dateTime: -1 });
    res.status(200).json(allOrders);
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Server error saving order" });
  }
};
export const sendmail = async (req, res) => {
  const { fullName, email, dateTime } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Canex Cleaning" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Canex Booking Confirmation",
      html: `
        <h2>Hi ${fullName},</h2>
        <p>Thank you for choosing <strong>Canex Cleaning</strong>!</p>
        <p>Your booking has been confirmed for <strong>${dateTime.toLocaleString()}</strong>.</p>
        <p>Service: <strong>${fullName}</strong></p>
        <p>We will contact you shortly at ${dateTime}.</p>
        <br/>
        <p>Regards,<br/>Team Canex Cleaning</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Booking confirmed. Email sent!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send confirmation email" });
  }
};
