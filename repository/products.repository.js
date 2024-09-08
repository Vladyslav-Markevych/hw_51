import { products } from "../storage.js";

export const checkProductById = (param) =>
  products.find((item) => item.id == param);

export const getProduct = () => products;

export const getProductByIdFromStorage = ({ id }) =>
  products.filter((one) => one.id == id);
