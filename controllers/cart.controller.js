import {
  addProductToCart,
  removeProductFromCart,
  checkoutCart,
} from "../services/cart.service.js";
import jwt from "jsonwebtoken";


export const addProductToCartHandler = async (req, res) => {
  const { accessToken } = req.cookies;
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
  const { idProduct } = req.params;

  try {
    const cart = addProductToCart(decoded.id, idProduct);
    res.status(200).json(cart);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const removeProductFromCartHandler = async (req, res) => {
  const { accessToken } = req.cookies;
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
  const { idProduct } = req.params;

  try {
    const cart = removeProductFromCart(decoded.id, idProduct);
    res.status(200).json(cart);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const checkoutHandler = async (req, res) => {
  const { accessToken } = req.cookies;
  const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);

  try {
    const order = checkoutCart(decoded.id);
    res.status(200).json(order);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
