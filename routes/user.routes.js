import { Router } from "express";
import {
  registerNewUser,
  logInUserController,
} from "../controllers/user.controller.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: User
 */
 
/**
 * @openapi
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - User
 *     description: Registers a new user by providing an email and password. Returns the newly created user if successful.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password for the new user.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Successfully registered a new user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier for the user.
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: The email address of the user.
 *                     password:
 *                       type: string
 *                       description: The hashed password of the user.
 *       401:
 *         description: Email is already registered.
 *       400:
 *         description: Validation Error. Required fields are missing or invalid.
 *       500:
 *         description: Internal server error.
 */
router.post("/api/register", registerNewUser);

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     tags:
 *       - User
 *     description: Authenticates a user and returns access and refresh tokens. Sets cookies for tokens if successful.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password for the user.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successfully logged in. Returns a success message.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ok"
 *       401:
 *         description: Invalid email or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 */
router.post("/api/login", logInUserController);

export default router;
