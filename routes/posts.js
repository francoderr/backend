import express from 'express'

import { Login, createUser, listUsers } from '../controllers/userController.js'
import { EditArt, UploadArt, fetchArt } from '../controllers/artController.js'
import { addToCart, fetchCartItems, fetchOrders, makeOrder, removeFromCart } from '../controllers/cartController.js'
import { createToken, stkPush } from '../controllers/mpesa.js'

const router  = express.Router()

router.post('/createUser', createUser)
router.post('/login', Login)
router.post('/uploadArt', UploadArt)
router.post('/fetchArt', fetchArt)
router.post('/listUsers', listUsers)
router.post('/addToCart', addToCart)
router.post('/fetchCartItems', fetchCartItems)
router.post('/removeFromCart', removeFromCart)
router.post('/makeOrder', makeOrder)
router.post('/getToken', createToken)
router.post('/stkPush', createToken, stkPush)
router.post('/fetchOrders', fetchOrders)
router.post('/EditArt', EditArt)

export default router