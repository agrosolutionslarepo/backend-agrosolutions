import { Response, NextFunction } from "express";
import { CustRequest, IUserToken } from "../custrequest";
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (request: CustRequest, _res: Response, next: NextFunction) => {
  try {
    const auth = request.get("authorization");
    let token = null;

    if (auth && auth.toLowerCase().startsWith("bearer")) {
      token = auth.substring(7);
    }

    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET) as IUserToken;

      if (!decodedToken.id) {
        throw new jwt.JsonWebTokenError();
      }

      request.user = decodedToken; // Ahora TypeScript reconoce que user es IUserToken

      console.log("Token decodificado:", request.user); // Para depuración

      next();
    } else {
      throw new jwt.JsonWebTokenError();
    }
  } catch (error) {
    next(error);
  }
};
