import { Router } from "express";
import {
  isAuth,
  isAuthentification,
  isAuthentificationAdmin,
} from "../middleware.js";
import {
  getProductFromStorage,
  createProductList,
  getProductById,
  uploadImage,
  uploadVideo,
  getImage,
  getVideo,
} from "../controllers/product.controller.js";

const router = Router();
/**
 * @openapi
 * tags:
 *   name: Product
 */

/**
 * @openapi
 * /api/products:
 *   get:
 *     description: Get a list of products. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns a list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: 123
 *                   name:
 *                     type: string
 *                     example: Product Name
 *       403:
 *         description: You do not have access.
 *       401:
 *         description: Unauthorized. Token may be missing or invalid.
 */
router.get("/api/products", isAuth, isAuthentification, getProductFromStorage);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     description: Get a specific product by its ID. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the product to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the product details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123
 *                 name:
 *                   type: string
 *                   example: Product Name
 *                 description:
 *                   type: string
 *                   example: A detailed description of the product.
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 19.99
 *       403:
 *         description: You do not have access.
 *       404:
 *         description: Product not found.
 *       401:
 *         description: Unauthorized. Token may be missing or invalid.
 */
router.get("/api/products/:id", isAuth, isAuthentification, getProductById);

/**
 * @openapi
 * /product:
 *   post:
 *     description: Create a new product. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Product
 *               description:
 *                 type: string
 *                 example: A detailed description of the new product.
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 29.99
 *             required:
 *               - name
 *               - description
 *               - price
 *     responses:
 *       200:
 *         description: Successfully created a new product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 name:
 *                   type: string
 *                   example: New Product
 *                 description:
 *                   type: string
 *                   example: A detailed description of the new product.
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 29.99
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 video:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       400:
 *         description: Bad request. The request data is invalid.
 *       401:
 *         description: Unauthorized. Token may be missing or invalid.
 */
router.post("/product", isAuth, isAuthentificationAdmin, createProductList);

/**
 * @openapi
 * /product/{productId}/image/upload:
 *   post:
 *     description: Upload an image file to a product. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: The ID of the product to which the image will be uploaded.
 *         required: true
 *         schema:
 *           type: string
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload.
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Successfully uploaded the image to the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 name:
 *                   type: string
 *                   example: Sample Product
 *                 description:
 *                   type: string
 *                   example: A detailed description of the sample product.
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 29.99
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "123e4567-e89b-12d3-a456-426614174000.jpg"
 *                 video:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error. Failed to upload the image.
 */
router.post(
  "/product/:productId/image/upload",
  isAuth,
  isAuthentificationAdmin,
  uploadImage
);

/**
 * @openapi
 * /product/{productId}/video/upload:
 *   post:
 *     description: Upload a video file to a product. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: productId
 *         in: path
 *         description: The ID of the product to which the video will be uploaded.
 *         required: true
 *         schema:
 *           type: string
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The video file to upload.
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Successfully uploaded the video to the product.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: 123e4567-e89b-12d3-a456-426614174000
 *                 name:
 *                   type: string
 *                   example: Sample Product
 *                 description:
 *                   type: string
 *                   example: A detailed description of the sample product.
 *                 price:
 *                   type: number
 *                   format: float
 *                   example: 29.99
 *                 image:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: []
 *                 video:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "123e4567-e89b-12d3-a456-426614174000.mp4"
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error. Failed to upload the video.
 */
router.post(
  "/product/:productId/video/upload",
  isAuth,
  isAuthentificationAdmin,
  uploadVideo
);

/**
 * @openapi
 * /product/image/{fileName}:
 *   get:
 *     description: Retrieve an image file associated with a product. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: fileName
 *         in: path
 *         description: The name of the image file to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the image file.
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Image not found.
 *       500:
 *         description: Internal server error. Failed to retrieve the image.
 */
router.get("/product/image/:fileName", isAuth, isAuthentification, getImage);

/**
 * @openapi
 * /product/video/{fileName}:
 *   get:
 *     description: Retrieve a video file associated with a product. 
 *     tags:
 *       - Product
 *     parameters:
 *       - name: fileName
 *         in: path
 *         description: The name of the video file to retrieve.
 *         required: true
 *         schema:
 *           type: string
 *       - name: accessToken
 *         in: cookie
 *         description: Access token for authentication.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the video file.
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video not found.
 *       500:
 *         description: Internal server error. Failed to retrieve the video.
 */
router.get("/product/video/:fileName", isAuth, isAuthentification, getVideo);

export default router;
