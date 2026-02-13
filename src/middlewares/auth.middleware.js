const jwt = require("jsonwebtoken");

const authArtist = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "artist") {
      return res.status(403).json({ message: "Access Forbidden" });
    }

    req.user = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const authUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (decodedToken.role !== "user") {
      return res.status(403).json({ message: "Access Forbidden" });
    }

    req.user = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authArtist, authUser };
