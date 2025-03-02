const Blog = require('../models/blog')
const asyncHandler = require('express-async-handler')

const createNewBlog = asyncHandler(async(req, res) =>{
    const { title, description, category} = req.body
    if (!title || !description || !category) throw new Error('Missing inputs')
    const response = await Blog.create(req.body)
    return res.json({
        success: response ? true : false,
        createBlog: response ? response :' Cannot create new blog   '
    })
})
const updateBlog = asyncHandler(async(req, res) =>{
    const {bid} = req.params
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    const response = await Blog.findByIdAndUpdate(bid, req.body, {new: true})
    return res.json({
        success: response ? true : false,
        updateBlog: response ? response :' Cannot update blog   '
    })
})
const getBlogs = asyncHandler(async(req, res) =>{
    const response = await Blog.find()
    return res.json({
        success: response ? true : false,
        blogs: response ? response :' Cannot get blogs '
    })
})

//LIKE
// DISLIKE

/*
Khi người dùng like 1 bài blogs thì :
1. Check xem người đó trước đó có Dislike hay không => bỏ dislike
2. Check xem người đó trước đó có like hay không =>bỏ like / thêm like
*/
//pull
//push
const likeBlog = asyncHandler(async(req, res) => {
    console.log("Request body:", req.body);
    const { _id } = req.user
    const {bid} = req.body
    if (!bid) throw new Error('Missing inputs') 
    const blog = await Blog.findById(bid)
    const alreadyDisliked = blog?.dislikes?.find(el => el.toString() === _id)
    if (alreadyDisliked){
        const response = await Blog.findByIdAdUpdate(bid, {$pull: {dislikes: _id} }, { new : true})
        return res.json({
            success: response ? true : false,
            rs: response
        })
    }
    const isLiked = blog?.likes?.find(el => el.toString() === _id)
        if(isLiked){
            const response = await Blog.findByIdAndUpdate(bid, {$pull: {likes: _id} }, { new : true})
            return res.json({
                success: response ? true : false,
                rs: response
            })
        }else{
            const response = await Blog.findByIdAndUpdate(bid, { $push: {likes: _id} }, { new : true} )
            return res.json({
                success: response ? true : false,
                rs: response
            })
        }
})


module.exports = {
    createNewBlog,
    updateBlog,
    getBlogs,
    likeBlog
}