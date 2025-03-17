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
    const excludeFields = ['limit', 'sort', 'page', 'fields']
    excludeFields.forEach(el => delete query[el])

    let queryStr = JSON.stringify(query)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
    const formatedQuery = JSON.parse(queryStr)
    console.log(formatedQuery);

    if (query?.title) formatedQuery.title = { $regex: query.title, $options: 'i' }
    let queryCommand = Product.find(formatedQuery)

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ')
        queryCommand = queryCommand.sort(sortBy)
    }

    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ')
        queryCommand = queryCommand.select(fields)
    }

    const page = +req.query.page || 1
    const limit = +req.query.limit || process.env.LIMIT_PRODUCTS
    const skip = (page - 1) * limit
    queryCommand = queryCommand.skip(skip).limit(limit)

    try {
        const response = await queryCommand.exec()
        const counts = await Product.countDocuments(formatedQuery)
        return res.status(200).json({
            success: response ? true : false,
            products: response ? response : 'Cannot get Products',
            counts
        })
    } catch (err) {
        throw new Error(err.message)
    }
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
const uploadImagesProduct = asyncHandler(async(req, res) => {
    const {pid} = req.params
    if (!req.files) throw new Error ('Missing Input')
    const response = await Product.findByIdAndUpdate(pid, {$push: {images: {$each: req.files.map(el => el.path)}}}, {new: true})
    return res.status(200).json({
        status: response ? true : false,
        updatedProduct: response ? response : 'Cannot upload image product'
    })
})
module.exports = {
    createProduct,
    getProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    ratings,
    uploadImagesProduct
}
