import Joi from "joi";
import crypto from "crypto";
import { ValidationError } from "../errorHandler.js";
import { addNewUser, getHashByEmail } from "../repository/users.repository.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const roles = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
};

const shema = Joi.object({
  email: Joi.string()
    .max(254)
    .pattern(new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"))
    .required(),

  password: Joi.string()
    .min(8)
    .pattern(
      new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[!@#$%^&*?]).{8,}$")
    )
    .required(),
});

export const createNewUser = async (param) => {
  const { error } = shema.validate(param);
  if (error) {
    throw new ValidationError("Validation Error");
  }

  const { email, password } = param;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUser = await addNewUser({
      id: crypto.randomUUID(),
      email: email,
      password: hashedPassword,
    });
    return newUser;
  } catch (err) {
    console.error("Error creating new user:", err);
    throw err;
  }
};

export const newAccessTokenCreate = (id, role) => {
  return jwt.sign({ role: role, id: id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: role === roles.ADMIN ? "1m" : "30m",
  });
};

export const newRefreshTokenCreate = (id, role) => {
  return jwt.sign({ role: role, id: id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};


export const logInUser = async ({ email, password }) => {
  try {
    const hash = await getHashByEmail(email);
    const isMatch = await bcrypt.compare(password, hash.password);

    if (!isMatch) {
      throw new ValidationError("Wrong email or password");
    }

    const role = email === "admin@gmail.com" ? roles.ADMIN : roles.CUSTOMER;
    const newAccessToken = newAccessTokenCreate(hash.id, role);
    const newRefreshToken = newRefreshTokenCreate(hash.id, role);

    return { newAccessToken, newRefreshToken };
  } catch (error) {
    throw new ValidationError("Error logging in");
  }
};


export const createAdminAccount = () => {
  const email = process.env.ADMIN_LOGIN;
  const password = process.env.ADMIN_PASS;
  const newAdmin = createNewUser({ email, password });
  addNewUser(newAdmin);
};
