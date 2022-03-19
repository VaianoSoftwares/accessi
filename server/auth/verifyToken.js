import jwt from "jsonwebtoken";

export default class AuthToken {
  static verifyGuest(req, res, next) {
    const token = req.header("guest-token");
    if (!token) {
      res.status(401).json({ success: false, msg: "Access denied." });
    }

    try {
      const verified = jwt.verify(token, process.env.GUEST_TOKEN);
      req.user = verified;
      next();
    } catch (err) {
      console.log(`auth - Invalid Token. ${err}`);
    }
  }

  static verifyAdmin(req, res, next) {
    const token = req.header("admin-token");
    if (!token) {
      res.status(401).json({ success: false, msg: "Access denied." });
    }

    try {
      const verified = jwt.verify(token, process.env.ADMIN_TOKEN);
      req.user = verified;
      next();
    } catch (err) {
      console.log(`auth - Invalid Token. ${err}`);
    }
  }
};