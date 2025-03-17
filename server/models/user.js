const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt');
const product = require('./product');

// Declare the Schema of the Mongo model
var usersSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true, 
    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true, // không được trùng 
    },
    mobile:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true, // bắt buộc có
    },
    role:{
        type:String,
        default: 'user',
    },
    cart:[{
        product: {type: mongoose.Types.ObjectId, ref: 'Product'},
        quantity:Number,
        color:String
    }],
    address:String,
    wishlist:[{type: mongoose.Types.ObjectId,ref: 'Product'}], // id sản phẩm người dùng yêu thích
    isBlocked: {
        type: Boolean,
        default: false
    }, // chức năng khóa tài khoản
    refreshToken: {
        type: String,

    },
    passwordChangeAt: { 
        type: String 
    },// quên mật khẩu
    passwordResetToken: {
        type: String
    }, // xác nhận tài lại tài khoản bằng cách gửi 1 cái mã token qua mail
    passwordResetExpries: {
        type: String
    } // thời gian cái mã token sau khi gửi tồn tại

}, {
    timestamps: true
});


usersSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next() // same return
    }
    const salt = bcrypt.genSaltSync(10)
    this.password = await bcrypt.hash(this.password,salt) // bỏ pass vào muối để băm

})

usersSchema.methods = {
    isCorrectPassword: async function(password) {
        return await bcrypt.compare(password, this.password)
    }
} // campare pass tra ve true or false

//Export the model
module.exports = mongoose.model('User', userSchema);