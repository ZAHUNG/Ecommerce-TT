const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const slugify = require('slugify')
const product = require('../models/product')

const createProduct = asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) throw new Error('Missing inputs')
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        createdProduct: newProduct ? newProduct : 'Cannot create new product'
    })
})
const getProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const product = await Product.findById(pid)
    return res.status(200).json({
        success: product ? true : false,
        productData: product ? product : 'Cannot get product'
    })
})
// Filtering, sorting & pagination
const getProducts = asyncHandler(async (req, res) => {
    const query = { ...req.query }
    // tách các trường đặc biệt khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'] 
    excludeFields.forEach(el => delete query[el]) 

    //format lại các operator của mongoose
    let queryStr = JSON.stringify(query)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    const formatedQuery = JSON.parse(queryStr)
    console.log(formatedQuery); 

    //filtering
    if(query?.title) formatedQuery.title = { $regex: query.title, $options: 'i' }
    let queryCommand = Product.find(formatedQuery)

    //sorting
    //chuyển dấu , thành khoảng cách vd: abc,cde => [abc,cde]=> abc cde
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    //fields limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    //pagination
    //limit: số object lấy về 1 lần gọi API
    //skip: = 2
    // vd có 1 2 3 ... 10 thì skip sẽ bỏ qua 1 2 rồi trả về 3-10,
    // limit = 2 thì lấy 1 2 bỏ 3-10
    //nếu cùng lúc lấy skip và limit thì bỏ 1 2 và lấy 3 4
    //LIMIT_PRODUCT: giới hạn sản phẩm hiển thị
    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS 
    const skip = (page -1)* limit
    queryCommand.skip(skip).limit(limit)
    
    //execute query 
    // số lượng sản phẩm thỏa mãn điều kiện khác với số lượng sp trả về 1 lần gọi API
    queryCommand.exec(async(err, Response)=> {
        if (err) throw new Error(err.message)
        const counts = await Product.find(formatedQuery).countsDocument()
        return res.status(200).json({
            success: Response ? true : false,
            products: Response ? Response : 'Cannot get Products',
            counts
        })  
    })


    const keysWord = ['title', 'description', 'category']
    keysWord.forEach(key => {
        if (query[key]) {
            query[key] = { $regex: new RegExp(query[key], 'i') }
        }
    })
    
    
})
const updateProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    if (req.body && req.body.title) req.body.slug = slugify(req.body.title)
    const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true })
    return res.status(200).json({
        success: updatedProduct ? true : false,
        updatedProduct: updatedProduct ? updatedProduct : 'Cannot update product'
    })
})
const deleteProduct = asyncHandler(async (req, res) => {
    const { pid } = req.params
    const deletedProduct = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: deletedProduct ? true : false,
        deletedProduct: deletedProduct ? deletedProduct : 'Cannot delete product'
    })
})

const ratings = asyncHandler(async (req, res ) => {
    const {_id} = req.user
    const {star, comment, pid} = req.body
    if (!star || !pid) throw new Error ('Missing Input')
    const alreadyProduct = await Product.findById(pid)
    const alreadyRating =ratingProduct?.ratings?.find(el => el.postedBy.toString() === _id) 
    //console.log({alreadyRating});
    if(alreadyRating){
        //update star and comment
        await Product.updateOne({
            ratings: {$elemMatch: alreadyRating}
        }, {
            $set: {"ratings.$.star": star, "ratings.$.comment": comment }
        }, {new: true})


    } else{
        //add star & comment
        await Product.findByIdAndUpdate(pid, {
            $push: {ratings:{star, comment, postedBy:_id}}
        }, {new: true})
        console.log(response);
    }
    
    //sum ratings
    const updatedProduct = await Product.findById(pid)
    const ratingCount = updatedProduct.ratings.length
    const sumRatings = updatedProduct.ratings.reduce((sum, el) => sum + +el.star,0)
    updatedProduct.totalRatings = Math.round(sumRatings *10 /ratingCount) /10

    await updatedProduct.save()

    return res.status(200).json({
        status: true,
        updatedProduct,
    })
})
module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings,
}
