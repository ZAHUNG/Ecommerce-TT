const jwt = require('jsonwebtoken') // chỉ có 2 hàm

const generateAccessToken = (uid, role) => jwt.sign({_id: uid, role}, process.env.JWT_SECRET, { expiresIn: '2d'})
const generateRefreshToken = (uid) => jwt.sign({_id: uid}, process.env.JWT_SECRET, { expiresIn: '7d'}) // dùng để tạo mới 1 accesstoken


module.exports = {
    generateAccessToken,
    generateRefreshToken
}