const router = require('express').Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const crtls = require('../controllers/blog')
const uploader = require('../config/cloudinary.config')

router.get('/',  crtls.getBlogs)
router.post('/', [verifyAccessToken, isAdmin], crtls.createNewBlog)
router.get('/one/:bid',  crtls.getBlog)
router.put('/likes/:bid', [verifyAccessToken], crtls.likeBlog)
router.put('/image/:bid', [verifyAccessToken, isAdmin], uploader.single('image') ,crtls.uploadImagesBlog)
router.put('/dislike/:bid', [verifyAccessToken], crtls.dislikeBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], crtls.updateBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], crtls.updateBlog)
router.delete('/:bid', [verifyAccessToken, isAdmin], crtls.deleteBlog)



module.exports = router