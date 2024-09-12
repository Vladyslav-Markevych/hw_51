import { users } from "../storage.js";
import { Unauthorized } from "../errorHandler.js";

export function checkIfUserRegistered({ email }) {
  const check = users.find((check) => check.email === email);
  return check;
}

export function addNewUser(param) {
  users.push(param);
  return param;
}

export const checkUserById = (param) => users.find((item) => item.id == param);



export const getHashByEmail = async (email) => {
  const check = users.find((user) => user.email == email);
  return check;
};
// export const checkRefreshToken = ({ email, password }) =>
//   users.find((user) => user.email === email && user.password === password);
