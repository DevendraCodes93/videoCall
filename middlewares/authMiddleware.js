import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  // Remove quotes if present
  if (token?.startsWith('"') && token?.endsWith('"')) {
    token = token.slice(1, -1);
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};
