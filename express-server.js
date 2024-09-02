import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();

app.use(bodyParser.json());

// products ----
app.use(productRoutes);

// register ----
app.use("/", userRoutes);

// carts -----
app.use(cartRoutes);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    message: `Error: ${err.message}`,
  });
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Started on port ${process.env.PORT}`);
});
