import express from "express";
import bodyParser from "body-parser";
import { users, products, carts, orders } from "./storage.js";
import crypto from "crypto";
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

app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const item = products.filter((one) => one.id == id);
  if (item.length === 0) {
    return errorProductFound(res);
    // res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(item);
});

app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
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

app.put("/api/cart/:idProduct", (req, res) => {
  const userId = checkUserById(req.headers["x-users-id"]);
  if (!userId) return errorVerify(res);

  const checkProduct = checkProductById(req.params.idProduct);
  if (!checkProduct) return errorProductFound(res);

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

app.delete("/api/cart/:idProduct", (req, res) => {
  const userId = checkUserById(req.headers["x-users-id"]);
  if (!userId) return errorVerify(res);

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
      res.status(404).json({ error: "Product not found in cart" });
    }
  } else {
    res.status(404).json({ error: "Cart not found" });
  }
});

app.post("/api/cart/checkout", (req, res) => {
  const userId = checkUserById(req.headers["x-users-id"]);
  if (!userId) return errorVerify(res);

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
    res.status(404).json({ error: "Cart not found" });
  }
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});
