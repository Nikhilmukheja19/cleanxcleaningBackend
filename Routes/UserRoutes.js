import express from "express";
import { login, register } from "../Controller/UserController.js";

const Adminrouter = express.Router();

Adminrouter.post("/login", login);
Adminrouter.post("/register", register);

export default Adminrouter;
