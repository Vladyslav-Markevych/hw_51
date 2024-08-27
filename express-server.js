import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import { users, products, carts, orders } from "./storage.js";
import crypto from "crypto";
import { CustomError, ValidationError, Unauthorized, NotFound } from "./errorHandler.js";
// import cors from "cors";
const app = express();
const port = 3000;

app.use(bodyParser.json());

const checkUserById = (param) => users.find((item) => item.id == param);
const checkCartByUserId = (param) => carts.find((item) => item.userId == param);
const checkProductById = (param) => products.find((item) => item.id == param);
const errorVerify = (res) => res.status(401).json({ error: "Not Verify" });
const errorProductFound = (res) =>
  res.status(401).json({ error: "Product didn't found" });

function validateEmail(email) {
  if (email.length > 254) {
    throw new ValidationError("Email is too long");
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.match(emailRegex)) {
    throw new ValidationError("Wrong email format");
  }
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    throw new ValidationError("Wrong email format");
  }
  if (domainPart.indexOf(".") === -1) {
    throw new ValidationError("Domain part is missing a dot (.)");
  }
  const domainParts = domainPart.split(".");
  if (domainParts.some((part) => part.length < 2)) {
    throw new ValidationError("Domain part is too short");
  }

  return true;
}

function validatePassword(password) {
  if (password.length < 8) {
    throw new ValidationError("Password is too short");
    // res.status(404).json({ error: "Password is too short" });
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/;
  if (!password.match(passwordRegex)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    );
  }

  return true;
}

function isAuth(req, res, next) {
  const idFromHeader = req.headers["x-user-id"];
  const check = users.find((check) => check.id === idFromHeader);
  if (!check) {
    throw new Unauthorized("Unauthorized");
  }
  next();
}

app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const item = products.filter((one) => one.id == id);
  if (item.length === 0) {
    throw new NotFound('Product not found')
    // res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(item);
});

app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  if (!validateEmail(email)) {
    return;
  }
  if (!validatePassword(password)) {
    return;
  }

  const id = crypto.randomUUID();
  const check = users.find((check) => check.email === email);
  if (check) {
    res.status(401).json("Email is already registered");
  } else {
    const newUser = {
      id,
      email,
      password,
    };
    users.push(newUser);
    res.status(201).json({ id, email });
  }
});

app.put("/api/cart/:idProduct", isAuth, (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const checkProduct = checkProductById(req.params.idProduct);
  if (!checkProduct)  throw new NotFound('Product not found');

  const checkCart = checkCartByUserId(userId.id);
  if (checkCart) {
    checkCart.products.push(checkProduct);
    res.status(200).json(checkCart);
  } else {
    const newCart = {
      id: crypto.randomUUID(),
      userId: userId.id,
      products: [checkProduct],
    };
    carts.push(newCart);
    res.status(200).json(newCart);
  }
});

app.delete("/api/cart/:idProduct", isAuth, (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const checkProduct = checkProductById(req.params.idProduct);
  if (!checkProduct) return errorProductFound(res);

  const checkCart = checkCartByUserId(userId.id);
  if (checkCart) {
    // checkCart.products = checkCart.products.filter((item) => item.id !== checkProduct.id);
    const indexProduct = checkCart.products.findIndex(
      (item) => item.id == checkProduct.id
    );
    if (indexProduct !== -1) {
      checkCart.products.splice(indexProduct, 1);
      res.status(200).json(checkCart);
    } else {
      throw new NotFound("Product not found");
    }
  } else {
    throw new NotFound("Cart not found");
  }
});

app.post("/api/cart/checkout", isAuth, (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const checkCart = checkCartByUserId(userId.id);
  if (checkCart) {
    const totalPrice = checkCart.products.reduce(
      (total, item) => total + item.price,
      0
    );
    checkCart.totalPrice = totalPrice;
    orders.push(checkCart);
    res.status(200).json(orders);
  } else {
    throw new NotFound("Cart not found");
  }
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: `Error: ${err.message}`,
  });
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Started on port ${process.env.PORT}`);
});
