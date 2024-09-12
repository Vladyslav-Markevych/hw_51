import jwt from "jsonwebtoken";
import { UnAuthentification, Unauthorized } from "./errorHandler.js";
import {
  newAccessTokenCreate,
  newRefreshTokenCreate,
} from "./services/user.service.js";

export function isAuth(req, res, next) {
  try {
    const { accessToken } = req.cookies;
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    updateRefreshToken(req, res, next);
  }
}
export function isAuthorization(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnAuthentification("You do not have access");
    }
    next();
  };
}


export function updateRefreshToken(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (decodedToken) {
      const newAccessToken = newAccessTokenCreate(decodedToken.id, decodedToken.role);
      const newRefreshToken = newRefreshTokenCreate(decodedToken.id, decodedToken.role);

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
