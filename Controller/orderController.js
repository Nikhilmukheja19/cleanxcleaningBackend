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
export const contactMail = async (req, res) => {
  const { email, message, phone, name } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Canex Cleaning Client" <${email}>`,
      to: `${process.env.EMAIL_USER}`,
      subject: `Customer From Contact us - ${name}`,
      html: `
        <h2>Hi Canex Cleaning</h2>
        <h4>Name : <strong>${name}</strong></h4>
        <p>Email : <strong>${email}</strong></p>
        <p>Mobile Number : <strong>${phone}</strong></p>
        <p>Message : <strong>${message}</strong></p>
        <br/>
        <p>Regards,<br/>${name}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ error: "Failed to send contact email" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderId },
      { $set: { status: "Fulfilled" } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found." });
    }

    // Send confirmation email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail", // or 'hotmail', 'yahoo', etc.
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your app password
      },
    });

    const mailOptions = {
      from: `"Canex Cleaning" <${process.env.EMAIL_USER}>`,
      to: updatedOrder.email,
      subject: `Your Order #${updatedOrder.orderId} is Fulfilled`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${updatedOrder.fullName},</h2>
          <p>Your order <strong>#${
            updatedOrder.orderId
          }</strong> has been successfully <b>Fulfilled</b>.</p>
          <p><b>Service Date & Time:</b> ${new Date(
            updatedOrder.dateTime
          ).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}</p>
          <p><b>Address:</b> ${updatedOrder.street}, ${updatedOrder.city}, ${
        updatedOrder.state
      } - ${updatedOrder.zip}</p>
          <br />
          <p>Thank you for choosing <strong>Canex Cleaning</strong>.</p>
          <p>Best regards,<br />Canex Team</p>
        </div>
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.status(200).json({
      message: "Order marked as Fulfilled and email sent.",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Server error updating order" });
  }
};
