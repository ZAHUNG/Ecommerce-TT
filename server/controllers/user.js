const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const {generateAccessToken, generateRefreshToken}= require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const product = require('../models/product')



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
        const {password, role, refreshToken, ...userData} = response.toObject()
        // tạo Access token
        const accessToken = generateAccessToken(response._id, role)
        // tạo Refresh token
        const newRefreshToken = generateRefreshToken(response._id)
        // lưu refresh token vào database
        await User.findByIdAndUpdate(response._id, { refreshToken: newRefreshToken }, { new: true})
        // lưu refresh token vào cookie
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }) // time 7 ngày
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
    const { _id } = req.user
    const user = await User.findById(_id).select('-refreshToken -password -role')
    return res.status(200).json({
        success: user ? true : false,
        rs: user ? user : 'User not found'
    })

})

const refreshAccessToken = asyncHandler(async(req, res) => {
    // lấy token từ cookie
    const cookie = req.cookies
    // check xem có token hay không
    if(!cookie && !cookie.refreshToken) throw new Error(' No refresh token in cookies')
    //check token có hợp lệ không
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET)
    const response = await User.findOne({_id: rs._id , refreshToken: cookie.refreshToken})
        return res.status(200).json({
            success: response ? true : false,
            newAccessToken: response ? generateAccessToken( response._id, response.role) : 'Refresh token not matched'
        })
    
})
 
const logout = asyncHandler(async (req, res) => {
    console.log("Cookies received:", req.cookies);
    const cookie = req.cookies
    if (!cookie || !cookie.refreshToken) throw new Error('No refresh token in cookies')
    // Xóa refresh token ở db
    await User.findOneAndUpdate({ refreshToken: cookie.refreshToken }, { refreshToken: '' }, { new: true })
    // Xóa refresh token ở cookie trình duyệt
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mes: 'Logout is done'
    })
})
const getUsers = asyncHandler(async (req, res) => {
    const response = await User.find().select('-refreshToken -password -role')
    return res.status(200).json({
        success: response ? true : false,
        users: response
    })
})
const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.query
    if (!_id) throw new Error('Missing inputs')
    const response = await User.findByIdAndDelete(_id)
    return res.status(200).json({
        success: response ? true : false,
        deletedUser: response ? `User with email ${response.email} deleted` : 'No user delete'
    })
})
const updateUser = asyncHandler(async (req, res) => {
    // 
    const { _id } = req.user
    if (!_id || Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(_id, req.body, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong'
    })
})
const updateUserByAdmin = asyncHandler(async (req, res) => {
    // 
    const { uid } = req.params
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(uid, req.body, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong'
    })
})
const updateUserAddress = asyncHandler(async (req, res) => { 
    const { _id } = req.user
    if (!req.body.address) throw new Error('Missing inputs')
    const response = await User.findByIdAndUpdate(_id, {$push: {address: req.body.address}}, { new: true }).select('-password -role -refreshToken')
    return res.status(200).json({
        success: response ? true : false,
        updatedUser: response ? response : 'Some thing went wrong'
    })
})
const updateCart = asyncHandler(async (req, res) => { 
    const { _id } = req.user
    const {pid, quantity, color} = req.body
    if (!pid || !quantity || !color) throw new Error('Missing inputs')
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart?.find(el => el.product.toString() === pid)
    if (alreadyProduct){
        if(alreadyProduct.color === color){
            const response = await User.updateOne({cart: {$elemMatch: alreadyProduct}}, {$set: {"cart.$.quantity": quantity}}, {new:true})
            return res.status(200).json({
                success: response ? true : false,
                updatedUser: response ? response : 'Some thing went wrong'
            })
        }else{
            const response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new:true})
            return res.status(200).json({
                success: response ? true : false,
                updatedUser: response ? response : 'Some thing went wrong'
            })    
        }
    }else{
        const response = await User.findByIdAndUpdate(_id, {$push: {cart: {product: pid, quantity, color}}}, {new:true})
        return res.status(200).json({
            success: response ? true : false,
            updatedUser: response ? response : 'Some thing went wrong'
        })
    }
    
})
module.exports = {
    register,
    login,
    getCurrent,
    refreshAccessToken,
    logout,
    getUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateUserAddress,
    updateCart
}