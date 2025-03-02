const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    numberViews:{
        type:Number,
        default:0,
    },
    likes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',

        }
    ],
    dislikes: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',

        }
    ],
    image: {
        type: String,
        default:  'https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcm0xODMtbnVubnktMzguanBn.jpg'
    },
    author:{
        type: String,
        default: 'Admin'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

//Export the model
module.exports = mongoose.model('Blog', blogSchema);