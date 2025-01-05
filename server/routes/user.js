const router = require('express').Router()
const crtls = require('../controllers/user')

router.post('/register', crtls.register)

module.exports = router