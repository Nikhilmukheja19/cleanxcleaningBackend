import OrderModel from "../Models/OrderModel.js";

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
