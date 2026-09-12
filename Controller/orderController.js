import nodemailer from "nodemailer";

import OrderModel from "../Models/OrderModel.js";
import dotenv from "dotenv";

dotenv.config();

export const orderSave = async (req, res) => {
  const generateOrderId = () => Math.floor(1000 + Math.random() * 9000);
  try {
    const {
      fullName,
      email,
      phone,
      dateTime,
      street,
      city,
      state,
      zip,
      serviceType,
    } = req.body;
    const parsedDate = new Date(dateTime);
    if (
      !fullName ||
      !email ||
      !phone ||
      !dateTime ||
      !street ||
      !city ||
      !state ||
      !serviceType ||
      !zip ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getTime() < Date.now()
    ) {
      return res.status(400).json({ error: "Please provide all fields and a future date." });
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
      serviceType,
      status: "Pending",
    });

    const savedOrder = await newOrder.save();
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
        serviceType: savedOrder.serviceType,
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
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const filter = req.query.status ? { status: req.query.status } : {};
    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ dateTime: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      OrderModel.countDocuments(filter),
    ]);
    res.status(200).json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Server error fetching orders" });
  }
};
export const sendmail = async (req, res) => {
  const { fullName, email, dateTime, serviceType } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const formattedDate = new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const mailOptions = {
      from: `"Canex Cleaning" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Canex Booking Confirmation",
      html: `
        <h2>Hi ${fullName},</h2>
        <p>Thank you for choosing <strong>Canex Cleaning</strong>!</p>
        <p>Your booking has been confirmed for <strong>${formattedDate}</strong>.</p>
        <p>Service: <strong>${serviceType}</strong></p>
        <p>We will contact you shortly.</p>
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
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Confirmed", "In Progress", "Fulfilled", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    const order = await OrderModel.findOne({ orderId: Number(orderId) });

    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    order.status = status;
    const updatedOrder = await order.save();

    let emailSent = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Canex Cleaning" <${process.env.EMAIL_USER}>`,
        to: updatedOrder.email,
        subject: `Your Order #${updatedOrder.orderId} is ${status}`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Hi ${updatedOrder.fullName},</h2>
          <p>Your order <strong>#${
            updatedOrder.orderId
          }</strong> status has been updated to <b>${status}</b>.</p>
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

      await transporter.sendMail(mailOptions);
      emailSent = true;
    }

    res.status(200).json({
      message: emailSent
        ? `Order status changed to ${status} and the customer was notified.`
        : `Order status changed to ${status}. Email notifications are not configured.`,
      order: updatedOrder,
      emailSent,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Server error updating order" });
  }
};
