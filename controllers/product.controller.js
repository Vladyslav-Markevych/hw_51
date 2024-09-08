import { getProduct } from "../repository/products.repository.js";
import { readJsonFile, writeJsonFile } from "../services/product.service.js";
import { NotFound } from "../errorHandler.js";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  validateProductData,
  createProductObject,
  getFileFromProduct,
  uploadFileToProduct,
} from "../services/product.service.js";
import eventEmitter from "../services/eventEmitter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getProductFromStorage = (req, res) => {
  const products = getProduct();
  res.status(200).json(products);
};

export const getProductById = (req, res) => {
  const item = getProductByIdFromStorage(req.params);
  if (item.length === 0) {
    throw new NotFound("Product not found");
  }
  res.status(200).json(item);
};

export const createProductList = async (req, res) => {
  try {
    validateProductData(req.body);
    const product = createProductObject(req.body);
    const filePathJson = path.join(__dirname, "../products.store.json");
    let productJSON = await readJsonFile(filePathJson);
    productJSON.push(product);
    await writeJsonFile(filePathJson, productJSON);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadImage = async (req, res) => {
  const { productId } = req.params;

  try {
    const obj = await uploadFileToProduct(productId, req, "image");
    res.status(200).json(obj);
  } catch (err) {
    console.error("Failed to process request:", err);
    res.status(500).json({ error: err.message });
  }
};

export const uploadVideo = async (req, res) => {
  const { productId } = req.params;

  try {
    const obj = await uploadFileToProduct(productId, req, "video");
    res.status(200).json(obj);
  } catch (err) {
    console.error("Failed to process request:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getImage = async (req, res) => {
  const { fileName } = req.params;

  try {
    eventEmitter.emit("fileUploadStart");
    const { filePath, obj } = await getFileFromProduct(fileName, "image");

    const stream = fs.createReadStream(filePath);
    stream.on("open", () => {
      eventEmitter.emit("fileUploadEnd");
    });

    stream.on("error", (error) => {
      eventEmitter.emit("fileUploadFailed", error);
      res.status(500).send("Ошибка сервера при чтении файла");
    });

    stream.pipe(res);
  } catch (err) {
    eventEmitter.emit("fileUploadFailed", err);
    res.status(500).send("Ошибка сервера");
  }
};

export const getVideo = async (req, res) => {
  const { fileName } = req.params;

  try {
    eventEmitter.emit("fileUploadStart");
    const { filePath, obj } = await getFileFromProduct(fileName, "video");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}.mp4"`
    );
    res.setHeader("Content-Type", "video/mp4");

    const stream = fs.createReadStream(filePath);
    stream.on("open", () => {
      eventEmitter.emit("fileUploadEnd");
    });

    stream.on("error", (error) => {
      eventEmitter.emit("fileUploadFailed", error);
      res.status(500).send("Ошибка сервера при чтении файла");
    });

    stream.pipe(res);
  } catch (err) {
    eventEmitter.emit("fileUploadFailed", err);
    res.status(500).send("Ошибка сервера");
  }
};
