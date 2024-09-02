import {
  addProductToCart,
  removeProductFromCart,
  checkoutCart,
} from "../services/cart.service.js";

export const addProductToCartHandler = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { idProduct } = req.params;

  try {
    const cart = addProductToCart(userId, idProduct);
    res.status(200).json(cart);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const removeProductFromCartHandler = async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { idProduct } = req.params;

  try {
    const cart = removeProductFromCart(userId, idProduct);
    res.status(200).json(cart);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const checkoutHandler = async (req, res) => {
  const userId = req.headers["x-user-id"];

  try {
    const order = checkoutCart(userId);
    res.status(200).json(order);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
