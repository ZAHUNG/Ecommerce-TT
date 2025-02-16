const router = require('express').Router()
const crtls = require('../controllers/user')
const {verifyAccessToken} = require('../middlewares/verifyToken')

router.post('/register', crtls.register)
router.post('/login', crtls.login)
router.get('/current', verifyAccessToken, crtls.getCurrent)

module.exports = router