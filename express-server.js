import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createAdminAccount } from "./services/user.service.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from 'swagger-ui-express'

const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());


createAdminAccount();

const swaggerSpec = swaggerJSDoc({
  failOnErrors: true, 
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Store App',
      version: '1.0.0',
    },
  },
  apis: ['./routes/*.routes.js'],
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
// products ----
app.use(productRoutes);

// register ----
app.use(userRoutes);

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
