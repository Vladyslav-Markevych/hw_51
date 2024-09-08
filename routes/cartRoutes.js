import { Router } from "express";
import { isAuth } from "../middleware.js";
import {
  addProductToCartHandler,
  removeProductFromCartHandler,
  checkoutHandler,
} from "../controllers/cart.controller.js";

const router = Router();

router.put("/api/cart/:idProduct", isAuth, addProductToCartHandler);
router.delete("/api/cart/:idProduct", isAuth, removeProductFromCartHandler);
router.post("/api/cart/checkout", isAuth, checkoutHandler);

export default router;
