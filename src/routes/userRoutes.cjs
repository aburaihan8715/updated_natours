const express = require('express');
const userController = require('../controllers/userController.cjs');
const authController = require('../controllers/authController.cjs');
const auth = require('../middlewares/auth.cjs');
const { USER_ROLE } = require('../constants/index.cjs');
const parseFormString = require('../middlewares/parseFormString.cjs');
const userFileUpload = require('../middlewares/userFileUpload.cjs');

const userRouter = express.Router();

// public
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.get('/logout', authController.logout);
userRouter.post('/forget-password', authController.forgetPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);

// for logged in user
userRouter.use(auth()); // bellow all are protected

userRouter.patch('/update-my-password', authController.updatePassword);
userRouter.patch(
  '/update-me',
  userFileUpload.single('file'),
  parseFormString(),
  userController.updateMe,
);
userRouter.delete('/delete-me', userController.deleteMe);
userRouter.get('/me', userController.getMe, userController.getUser);

// for admin user
userRouter.use(auth(USER_ROLE.admin)); // bellow all are protected

userRouter.post('/', userController.createUser);
userRouter.get('/', userController.getAllUsers);
userRouter.get('/:id', userController.getUser);
userRouter.patch('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);

module.exports = userRouter;
