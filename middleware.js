export function isAuth(req, res, next) {
    const idFromHeader = req.headers["x-user-id"];
  
    const check = users.find((check) => check.id === idFromHeader);
    if (!check) {
      throw new Unauthorized("Unauthorized");
    }
    next();
  }