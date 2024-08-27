import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const filePath = "../products.store.json";
const filePath = path.join(__dirname, "../products.store.json");

export async function getProducts() {
  try {
    const data = await fs.readFile(filePath, "utf8");
    const products = JSON.parse(data);
    return products;
  } catch (err) {
    console.error(err);
    return [];
  }
}

  // fs.readFile(filePath, "utf8", (err, data) => {
  //   if (err) {
  //     return false;
  //   }

  //   let products = [];

  //   if (data) {
  //     try {
  //       products = JSON.parse(data);
  //     } catch (err) {
  //       return false;
  //     }
  //   }
  // });