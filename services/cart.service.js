import crypto from "crypto";
import { carts, orders } from "../storage.js";
import { checkProductById } from "../repository/products.repository.js";
import { checkCartByUserId } from "../repository/cart.repository.js";
import { NotFound } from "../errorHandler.js";

export const addProductToCart = (userId, productId) => {
  const checkProduct = checkProductById(productId);
  if (!checkProduct) {
    throw new NotFound("Product not found");
  }

  const checkCart = checkCartByUserId(userId);
  if (checkCart) {
    checkCart.products.push(checkProduct);
    return checkCart;
  } else {
    const newCart = {
      id: crypto.randomUUID(),
      userId,
      products: [checkProduct],
    };
    carts.push(newCart);
    return newCart;
  }
};

export const removeProductFromCart = (userId, productId) => {
  const checkProduct = checkProductById(productId);
  if (!checkProduct) {
    throw new NotFound("Product not found");
  }

  const checkCart = checkCartByUserId(userId);
  if (checkCart) {
    const indexProduct = checkCart.products.findIndex(
      (item) => item.id === checkProduct.id
    );
    if (indexProduct !== -1) {
      checkCart.products.splice(indexProduct, 1);
      return checkCart;
    } else {
    throw new NotFound("Product not found");
    }
  } else {
    throw new NotFound("Cart not found");
  }
};

export const checkoutCart = (userId) => {
  const checkCart = checkCartByUserId(userId);
  console.log('checkCart ------------------------ ',checkCart)
  if (checkCart) {
    const totalPrice = checkCart.products.reduce(
      (total, item) => total + item.price,
      0
    );
    checkCart.totalPrice = totalPrice;
    orders.push(checkCart);
    return checkCart;
  } else {
    throw new NotFound("Cart not found");
  }
};
