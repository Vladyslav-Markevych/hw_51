import jwt from "jsonwebtoken";
import { UnAuthentification, Unauthorized } from "./errorHandler.js";
import {
  newAccessTokenCreate,
  newRefreshTokenCreate,
} from "./services/user.service.js";

export function isAuth(req, res, next) {
  try {
    const { accessToken } = req.cookies;
    const decoded = jwt.verify(accessToken, process.env.PASS_TOKEN);
    console.log(decoded);
    next();
  } catch (err) {
    updateRefreshToken(req, res, next);
  }
}

export function isAuthentification(req, res, next) {
  try {
    const { accessToken } = req.cookies;
    const decoded = jwt.verify(accessToken, process.env.PASS_TOKEN);
    if (decoded.role !== "Customer" && decoded.role !== "Admin") {
      throw new UnAuthentification("You do not have access");
    }
    next();
  } catch (err) {
      throw new UnAuthentification("You do not have access");
  }
}
export function isAuthentificationAdmin(req, res, next) {
  try {
    const { accessToken } = req.cookies;
    const decoded = jwt.verify(accessToken, process.env.PASS_TOKEN);
    console.log("role-----------", decoded.role);
    if (decoded.role !== "Admin") {
      throw new UnAuthentification("You do not have access");
    }
    next();
  } catch (err) {
      throw new UnAuthentification("You do not have access");
  }
}

export function updateRefreshToken(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const decodedToken = jwt.verify(refreshToken, process.env.PASS_TOKEN);
    if (decodedToken) {
      const newAccessToken = newAccessTokenCreate();
      const newRefreshToken = newRefreshTokenCreate();
      console.log(
        "newaccess",
        jwt.verify(newAccessToken, process.env.PASS_TOKEN)
      );
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "None",
        domain: "localhost",
        secure: true,
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        domain: "localhost",
        secure: true,
      });
    }

    next();
  } catch (err) {
    throw new Unauthorized("You do not have access");
  }
}
