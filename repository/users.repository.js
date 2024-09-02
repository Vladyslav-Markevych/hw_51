import { users } from "../storage.js";
import { Unauthorized } from "../errorHandler.js";

export function checkIfUserRegistered({ email }) {
  const check = users.find((check) => check.email === email);
  return check;
}

export function isAuth(req, res, next) {
  const idFromHeader = req.headers["x-user-id"];

  const check = users.find((check) => check.id === idFromHeader);
  if (!check) {
    throw new Unauthorized("Unauthorized");
  }
  next();
}

export function addNewUser(param) {
  users.push(param);
  return param;
}

export const checkUserById = (param) => users.find((item) => item.id == param);
