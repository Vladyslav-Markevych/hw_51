import { checkIfUserRegistered } from "../repository/users.repository.js";
import { createNewUser } from "../services/user.service.js";
import { logInUser } from "../services/user.service.js";
import { ValidationError } from "../errorHandler.js";

export const registerNewUser = async (req, res) => {
  const check = checkIfUserRegistered(req.body);
  if (check) {
    res.status(401).json("Email is already registered");
  } else {
    try {
      const newUser = await createNewUser(req.body);
      res.status(201).json({ newUser });
    } catch (err) {
      console.log(err);
    }
  }
};

export const logInUserController = async (req, res) => {
  try {
    const { newAccessToken, newRefreshToken } = await logInUser(req.body);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "None",
      // domain: "http://127.0.0.1:5500/",
      domain: "localhost",
      secure: true,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "None",
      // domain: "http://127.0.0.1:5500/",
      domain: "localhost",
      secure: true,
    });
    res.json({ message: "Ok" });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
