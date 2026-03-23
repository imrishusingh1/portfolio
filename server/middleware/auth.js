import jwt from 'jsonwebtoken'

export function getJWTSecret() {
  return process.env.JWT_SECRET || 'portfolio-admin-secret-key-change-me'
}

export default function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, getJWTSecret())
    req.adminId = decoded.id
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
