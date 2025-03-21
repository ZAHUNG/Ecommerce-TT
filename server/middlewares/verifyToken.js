const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const verifyAccessToken = asyncHandler(async(req, res, next) => {
   
    // Bearer token: quy định chung
    // headers: {authorization: Bearer token}
    if (req?.headers?.authorization?.startsWith('Bearer')){
        const token = req.headers.authorization.split(' ')[1] // xác minh token
        console.log("Extracted Token:", token);  // Kiểm tra token
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) return res.status(401).json({
                success: false,
                mes: 'Invalid access token'// token không hợp lệ 
            })
            req.user = decode
            next()    
        })
    }else{
        return res.status(401).json({
            success: false,
            mes: 'Require authentication!!!' // không tìm thấy token
        })
    }
})
const isAdmin = asyncHandler((req, res, next) => {
    const { role } = req.user
    if (role !== 'admin')
        return res.status(401).json({
            success: false,
            mes: ' REQUIRE ADMIN ROLE'
        })
    next()
})

module.exports = {
    verifyAccessToken,
    isAdmin
}