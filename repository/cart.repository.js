import { carts } from "../storage.js";

export const checkCartByUserId = (param) => carts.find((item) => item.userId == param);
