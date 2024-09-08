import crypto from "crypto";
import { ValidationError } from "../errorHandler.js";
import fs from "fs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import { NotFound } from "../errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const validateProductData = ({ name, description, price }) => {
  if (!name || !description || !price) {
    throw new ValidationError("You need to add name, description, and price");
  }
};

export const createProductObject = (name, description, price) => {
  return {
    id: crypto.randomUUID(),
    name,
    description,
    price,
    image: [],
    video: [],
  };
};

export function readJsonFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        return reject(err);
      }
      if (!data) {
        const initialData = [];
        return resolve(initialData);
      }
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

export const writeJsonFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", (err) => {
      if (err) {
        return reject(new Error("Could not write to the JSON file"));
      }
      resolve();
    });
  });
};

export const uploadFileToProduct = async (productId, fileStream, fileType) => {
  const id = crypto.randomUUID();
  const directoryPath = path.join(
    __dirname,
    "../productFiles",
    productId,
    fileType
  );
  const filePathJson = path.join(__dirname, "../products.store.json");

  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });

    const fileExtension = fileType === "image" ? "jpg" : "mp4";
    const filePath = path.join(directoryPath, `${id}.${fileExtension}`);
    const writeFile = fs.createWriteStream(filePath);

    fileStream.pipe(writeFile);

    let productJSON = await readJsonFile(filePathJson);
    const obj = productJSON.find((item) => item.id === productId);

    if (!obj) {
    throw new NotFound("Product not found");
    }

    if (fileType === "image") {
      obj.image.push(`${id}.${fileExtension}`);
    } else {
      obj.video.push(`${id}.${fileExtension}`);
    }

    await writeJsonFile(filePathJson, productJSON);

    return obj;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.message}`);
  }
};

export const getFileFromProduct = async (fileName, fileType) => {
  const fileExtension = fileType === "image" ? "jpg" : "mp4";
  const filePathJson = path.join(__dirname, "../products.store.json");

  try {
    let productJSON = await readJsonFile(filePathJson);
    const fullFileName = `${fileName}.${fileExtension}`;
    const obj = productJSON.find((item) =>
      fileType === "image"
        ? item.image.includes(fullFileName)
        : item.video.includes(fullFileName)
    );

    if (!obj) {
      throw new Error(
        `${
          fileType.charAt(0).toUpperCase() + fileType.slice(1)
        } не найден в базе данных`
      );
    }

    const filePath = path.join(
      __dirname,
      "../productFiles",
      obj.id,
      fileType,
      fullFileName
    );
    return { filePath, obj };
  } catch (err) {
    throw new Error(`Не удалось получить ${fileType}: ${err.message}`);
  }
};
