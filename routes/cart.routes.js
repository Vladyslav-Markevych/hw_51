import { Router } from "express";
import { isAuth, isAuthorization, roles } from "../middleware.js";
import {
  addProductToCartHandler,
  removeProductFromCartHandler,
  checkoutHandler,
} from "../controllers/cart.controller.js";

const router = Router();
/**
 * @openapi
 * tags:
 *   name: Cart
 */

/**
 * @openapi
 * /api/cart/{idProduct}:
 *   put:
 *     summary: Add a product to the cart
 *     description: Adds a product identified by `idProduct` to the user's cart. 
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to be added to the cart.
 *       - in: cookie
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Access token for authorization.
 *     responses:
 *       200:
 *         description: Product successfully added to the cart.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the cart.
 *                 userId:
 *                   type: string
 *                   description: ID of the user.
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID of the product.
 *                       name:
 *                         type: string
 *                         description: Name of the product.
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Price of the product.
 *       401:
 *         description: Unauthorized or invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       404:
 *         description: Product not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
router.put("/api/cart/:idProduct", isAuth, isAuthorization([roles.CUSTOMER]), addProductToCartHandler);

/**
 * @openapi
 * /api/cart/{idProduct}:
 *   delete:
 *     summary: Remove a product from the user's cart
 *     description: Removes a product from the cart of the user.
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: path
 *         name: idProduct
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to remove from the cart.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully removed product from the cart.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the cart.
 *                 userId:
 *                   type: string
 *                   description: ID of the user.
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: ID of the product.
 *                       name:
 *                         type: string
 *                         description: Name of the product.
 *                       price:
 *                         type: number
 *                         format: float
 *                         description: Price of the product.
 *       401:
 *         description: Unauthorized or invalid access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       404:
 *         description: Product or cart not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
router.delete("/api/cart/:idProduct", isAuth, isAuthorization([roles.CUSTOMER]), removeProductFromCartHandler);

/**
 * @openapi
 * /api/cart/checkout:
 *   post:
 *     summary: Checkout the user's cart
 *     description: Processes the checkout for the user's cart. 
 *     tags:
 *       - Cart
 *     parameters:
 *       - in: cookie
 *         name: accessToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Access token for authorization.
 *     responses:
 *       200:
 *         description: Successfully checked out the cart and returns the updated orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: ID of the cart.
 *                   userId:
 *                     type: string
 *                     description: ID of the user.
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: ID of the product.
 *                         name:
 *                           type: string
 *                           description: Name of the product.
 *                         price:
 *                           type: number
 *                           format: float
 *                           description: Price of the product.
 *                   totalPrice:
 *                     type: number
 *                     format: float
 *                     description: Total price of the cart.
 *       401:
 *         description: Unauthorized or invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       404:
 *         description: Cart not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
router.post("/api/cart/checkout", isAuth, isAuthorization([roles.CUSTOMER]), checkoutHandler);

export default router;
