import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import { users, products, carts, orders } from "./storage.js";
import crypto from "crypto";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { getProducts } from "./helper/getProducts.js";
import { EventEmitter } from "events";

import {
  CustomError,
  ValidationError,
  Unauthorized,
  NotFound,
} from "./errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// import cors from "cors";
const app = express();
const port = 3000;

const eventEmitter = new EventEmitter();
const logFilePath = path.join(__dirname, "filesUpload.log");

const logToFile = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) console.error("Error writing to log file:", err);
  });
};

eventEmitter.on("fileUploadStart", () => {
  logToFile("File upload started");
});

eventEmitter.on("fileUploadEnd", () => {
  logToFile("File upload ended successfully");
});

eventEmitter.on("fileUploadFailed", (error) => {
  logToFile(`File upload failed: ${error.message}`);
});

app.use(bodyParser.json());

const checkUserById = (param) => users.find((item) => item.id == param);
const checkCartByUserId = (param) => carts.find((item) => item.userId == param);
const checkProductById = (param) => products.find((item) => item.id == param);
const errorVerify = (res) => res.status(401).json({ error: "Not Verify" });
const errorProductFound = (res) =>
  res.status(401).json({ error: "Product didn't found" });

function validateEmail(email) {
  if (email.length > 254) {
    throw new ValidationError("Email is too long");
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email.match(emailRegex)) {
    throw new ValidationError("Wrong email format");
  }
  const [localPart, domainPart] = email.split("@");
  if (!localPart || !domainPart) {
    throw new ValidationError("Wrong email format");
  }
  if (domainPart.indexOf(".") === -1) {
    throw new ValidationError("Domain part is missing a dot (.)");
  }
  const domainParts = domainPart.split(".");
  if (domainParts.some((part) => part.length < 2)) {
    throw new ValidationError("Domain part is too short");
  }

  return true;
}

function validatePassword(password) {
  if (password.length < 8) {
    throw new ValidationError("Password is too short");
    // res.status(404).json({ error: "Password is too short" });
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).{8,}$/;
  if (!password.match(passwordRegex)) {
    throw new ValidationError(
      "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    );
  }

  return true;
}

function isAuth(req, res, next) {
  const idFromHeader = req.headers["x-user-id"];
  const check = users.find((check) => check.id === idFromHeader);
  if (!check) {
    throw new Unauthorized("Unauthorized");
  }
  next();
}

function readJsonFile(filePath) {
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

app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const item = products.filter((one) => one.id == id);
  if (item.length === 0) {
    throw new NotFound("Product not found");
    // res.status(404).json({ error: "Product not found" });
  }
  res.status(200).json(item);
});

app.post("/api/register", (req, res) => {
  const { email, password } = req.body;
  if (!validateEmail(email)) {
    return;
  }
  if (!validatePassword(password)) {
    return;
  }

  const id = crypto.randomUUID();
  const check = users.find((check) => check.email === email);
  if (check) {
    res.status(401).json("Email is already registered");
  } else {
    const newUser = {
      id,
      email,
      password,
    };
    users.push(newUser);
    res.status(201).json({ id, email });
  }
});

app.put("/api/cart/:idProduct", isAuth, (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const checkProduct = checkProductById(req.params.idProduct);
  if (!checkProduct) throw new NotFound("Product not found");

  const checkCart = checkCartByUserId(userId.id);
  if (checkCart) {
    checkCart.products.push(checkProduct);
    res.status(200).json(checkCart);
  } else {
    const newCart = {
      id: crypto.randomUUID(),
      userId: userId.id,
      products: [checkProduct],
    };
    carts.push(newCart);
    res.status(200).json(newCart);
  }
});

app.delete("/api/cart/:idProduct", isAuth, (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const checkProduct = checkProductById(req.params.idProduct);
  if (!checkProduct) return errorProductFound(res);

  const checkCart = checkCartByUserId(userId.id);
  if (checkCart) {
    // checkCart.products = checkCart.products.filter((item) => item.id !== checkProduct.id);
    const indexProduct = checkCart.products.findIndex(
      (item) => item.id == checkProduct.id
    );
    if (indexProduct !== -1) {
      checkCart.products.splice(indexProduct, 1);
      res.status(200).json(checkCart);
    } else {
      throw new NotFound("Product not found");
    }
  } else {
    throw new NotFound("Cart not found");
  }
});

app.post("/api/cart/checkout", isAuth, (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const checkCart = checkCartByUserId(userId.id);
  if (checkCart) {
    const totalPrice = checkCart.products.reduce(
      (total, item) => total + item.price,
      0
    );
    checkCart.totalPrice = totalPrice;
    orders.push(checkCart);
    res.status(200).json(orders);
  } else {
    throw new NotFound("Cart not found");
  }
});

// hw_53
app.post("/product", async (req, res) => {
  const userId = checkUserById(req.headers["x-user-id"]);

  const { name, description, price } = req.body;
  if (!name || !description || !price) {
    throw new NotFound("You need to add name and description and price");
  }
  const id = crypto.randomUUID();
  const obj = {
    id: id,
    name: name,
    description: description,
    price: price,
    image: [],
    video: [],
  };
  const filePathJson = path.join(__dirname, "./products.store.json");

  let productJSON = await readJsonFile(filePathJson);

  productJSON.push(obj);

  fs.writeFile(
    filePathJson,
    JSON.stringify(productJSON, null, 2),
    "utf8",
    (err) => {
      res.status(200).json(obj);
    }
  );
});

app.post("/product/:productId/image/upload", async (req, res) => {
  const { productId } = req.params;
  const id = crypto.randomUUID();
  const directoryPath = path.join(__dirname, "productFiles", productId, "image");
  const filePathJson = path.join(__dirname, "./products.store.json");

  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });

    const filePath = path.join(directoryPath, `${id}.jpg`);
    eventEmitter.emit("fileUploadStart");

    let productJSON = await readJsonFile(filePathJson);
    const obj = productJSON.find((item) => item.id == productId);

    if (obj) {
      obj.image.push(`${id}.jpg`);
    } else {
      console.log("Object not found");
    throw new NotFound("Product not found");

    }

    const writeFile = fs.createWriteStream(filePath);
    req.pipe(writeFile);

    writeFile.on("finish", async () => {
      console.log("Uploaded");
      eventEmitter.emit("fileUploadEnd");

      await fs.promises.writeFile(
        filePathJson,
        JSON.stringify(productJSON, null, 2),
        "utf8"
      );

      res.status(200).json(obj);
    });

    writeFile.on("error", (err) => {
      console.error("File upload error:", err);
      eventEmitter.emit("fileUploadFailed", err);
      res.status(500).send("Error uploading file");
    });

  } catch (err) {
    console.error("Failed to process request:", err);
    eventEmitter.emit("fileUploadFailed", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

app.post("/product/:productId/video/upload", async (req, res) => {
  const { productId } = req.params;
  const id = crypto.randomUUID();
  const directoryPath = path.join(__dirname, "productFiles", productId, "video");

  try {
    await fs.promises.mkdir(directoryPath, { recursive: true });

    const filePath = path.join(directoryPath, `${id}.mp4`);
    eventEmitter.emit("fileUploadStart");

    const filePathJson = path.join(__dirname, "./products.store.json");
    let productJSON = await readJsonFile(filePathJson);
    const obj = productJSON.find((item) => item.id == productId);

    if (obj) {
      obj.video.push(`${id}.mp4`);
    } else {
      console.log("Object not found");
    throw new NotFound("Product not found");

    }

    const writeFile = fs.createWriteStream(filePath);
    req.pipe(writeFile);

    writeFile.on("finish", async () => {
      console.log("Uploaded");
      eventEmitter.emit("fileUploadEnd");

      await fs.promises.writeFile(
        filePathJson,
        JSON.stringify(productJSON, null, 2),
        "utf8"
      );

      res.status(200).json(obj);
    });

    writeFile.on("error", (err) => {
      console.error("File upload error:", err);
      eventEmitter.emit("fileUploadFailed", err);
      res.status(500).send("Error uploading file");
    });
  } catch (err) {
    console.error("Failed to create directory or update JSON:", err);
    eventEmitter.emit("fileUploadFailed", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

app.get("/product/image/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const filePathJson = path.join(__dirname, "./products.store.json");
  try {
    eventEmitter.emit("fileUploadStart");
    let productJSON = await readJsonFile(filePathJson);
    const NameFile = fileName + ".jpg";
    // console.log("json", productJSON);
    const obj = productJSON.find((item) => item.image.includes(NameFile));
    // console.log(obj);
    if (!obj) {
      eventEmitter.emit(
        "fileUploadFailed",
        new Error("Image not found in database")
      );
    throw new NotFound("Image not found in database");
    }
    const imagePath = path.join(
      __dirname,
      "productFiles",
      obj.id,
      "image",
      NameFile
    );

    const stream = fs.createReadStream(imagePath);
    stream.on("open", () => {
      eventEmitter.emit("fileUploadEnd");
    });

    stream.on("error", (error) => {
      eventEmitter.emit("fileUploadFailed", error);
      res.status(500).send("Server error while reading the file");
    });

    stream.pipe(res);
  } catch (err) {
    eventEmitter.emit("fileUploadFailed", err);
    res.status(500).send("Server error");
  }
});
app.get("/product/video/:fileName", async (req, res) => {
  const { fileName } = req.params;
  const filePathJson = path.join(__dirname, "./products.store.json");
  try {
    eventEmitter.emit("fileUploadStart");
    let productJSON = await readJsonFile(filePathJson);
    const NameFile = fileName + ".mp4";
    const obj = productJSON.find((item) => item.video.includes(NameFile));
    if (!obj) {
    throw new NotFound("video not found in database");
    }
    const videoPath = path.join(
      __dirname,
      "productFiles",
      obj.id,
      "video",
      NameFile
    );
    const stream = fs.createReadStream(videoPath);
    stream.on("open", () => {
      eventEmitter.emit("fileUploadEnd");
    });

    stream.on("error", (error) => {
      eventEmitter.emit("fileUploadFailed", error);
      res.status(500).send("Server error while reading the file");
    });

    stream.pipe(res);
  } catch (err) {
    eventEmitter.emit("fileUploadFailed", err);
    res.status(500).send("Server error");
  }
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: `Error: ${err.message}`,
  });
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Started on port ${process.env.PORT}`);
});
