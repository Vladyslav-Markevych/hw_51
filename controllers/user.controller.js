import { checkIfUserRegistered } from "../repository/users.repository.js";
import { createNewUser } from "../services/user.service.js";

export const registerNewUser = (req, res) => {
  const check = checkIfUserRegistered(req.body);
  if (check) {
    res.status(401).json("Email is already registered");
  } else {
    const newUser = createNewUser(req.body);
    res.status(201).json({ newUser });
  }
};
