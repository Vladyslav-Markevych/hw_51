import { Router } from "express";

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

router.get("/api/products", getProductFromStorage);

router.get("/api/products/:id", getProductById);

router.post("/product", createProductList);

router.post("/product/:productId/image/upload", uploadImage);

router.post("/product/:productId/video/upload", uploadVideo);

router.get("/product/image/:fileName", getImage);

router.get("/product/video/:fileName", getVideo);

export default router;
