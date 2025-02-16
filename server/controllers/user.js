const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const {generateAccessToken, generateRefreshToken}= require('../middlewares/jwt')



const register = asyncHandler(async(req, res) =>{
    const {email, password, firstname, lastname } = req.body
    if( !email || !password || !lastname || !firstname)
    return res.status(400).json({
        success: false,
        mes: 'Missing inputs'
    })

    const user = await User.findOne({ email })
    if (user) throw new Error('User has exeisted')  
    else {
        const newUser = await User.create(req.body)
        return res.status(200).json({
            sucess: newUser ? true : false,
            mes: newUser ? 'Register is successfully. Please go loggin' : 'Something went wrong'
        })    
    }

})
// Refresh token => chỉ cấp mới Access token
// Access token => xác thực người dùng , phân quyền người dùng

const login = asyncHandler(async(req, res) =>{
    const {email, password } = req.body
    if( !email || !password )
    return res.status(400).json({
        success: false,
        mes: 'Missing inputs'
    })

    const response = await User.findOne({email})
    if (response && await response.isCorrectPassword(password)){
        // tách password và role ra khỏi response
        const {password, role, ...userData} = response.toObject()
        // tạo Access token
        const accessToken = generateAccessToken(response._id, role)
        // tạo Refresh token
        const refreshToken = generateRefreshToken(response._id)
        // lưu refresh token vào database
        await User.findByIdAndUpdate(response._id, {refreshToken}, { new: true})
        // lưu refresh token vào cookie
        res.cookie('refreshtoken', refreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    }else{
        throw new Error('Invalid credentials! ')
    }

})

const getCurrent = asyncHandler(async(req, res) =>{
    const { _id} = req.user
    const user = await User.findById(_id).select('-refreshtoken -password -role')
    return res.status(200).json({
        success: false,
        rs: user ? user : 'User not found'
    })

})

module.exports = {
    register,
    login,
    getCurrent
}