const router = require('express').Router()
const { verifyAccessToken, isAdmin } = require('../middlewares/verifyToken')
const crtls = require('../controllers/blog')

router.get('/',  crtls.getBlogs)
router.post('/', [verifyAccessToken, isAdmin], crtls.createNewBlog)
router.put('/like', [verifyAccessToken], crtls.likeBlog)
router.put('/:bid', [verifyAccessToken, isAdmin], crtls.updateBlog)



module.exports = router