import Joi from "joi";
import crypto from "crypto";
import { ValidationError } from "../errorHandler.js";
import { addNewUser } from "../repository/users.repository.js";

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

export const createNewUser = (param) => {
  const { error } = shema.validate(param);
  if (error) {
    throw new ValidationError(error.details[0].message);
  }
  const { email, password } = param;
  let newUser = addNewUser({
    id: crypto.randomUUID(),
    email: email,
    password: password,
  });
  delete newUser.password;
  return newUser;
};
