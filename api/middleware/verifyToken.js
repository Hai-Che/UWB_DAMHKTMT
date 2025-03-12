import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated!' });
  }

  const decoded = jwt.decode(token);
  if (decoded && decoded.role === 'Admin') {
    req.userId = decoded.id;
    req.role = decoded.role;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not valid' });
    }

    req.userId = payload.id;
    req.role = payload.role;

    next();
  });
};
