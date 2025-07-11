const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization)
    return res.status(401).json({ error: "Token not found." });

  // Extract the jwt token from the request headers
  const token = authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// function to generate jwt token
const generateToken = (userData) => {
  // generate new jwt token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: 3000000 });
};

module.exports = { jwtAuthMiddleware, generateToken };
