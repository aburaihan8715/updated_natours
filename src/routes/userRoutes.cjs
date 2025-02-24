/*
const express = require('express');
const userController = require('../controllers/userController.cjs');
const authController = require('../controllers/authController.cjs');

const router = express.Router();

// AUTH RELATED
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

// USER RELATED
// Restrict all routes after this middleware
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
*/

const express = require('express');
const userController = require('../controllers/userController.cjs');
const authController = require('../controllers/authController.cjs');

const auth = require('../middlewares/auth.cjs');
const { USER_ROLE } = require('../constants/index.cjs');

const userRouter = express.Router();
// auth related
userRouter.post('/signup', authController.signup);
userRouter.post('/login', authController.login);
userRouter.post('/forget-password', authController.forgetPassword);
userRouter.patch('/reset-password/:token', authController.resetPassword);
userRouter.patch(
  '/update-my-password',
  auth(
    USER_ROLE.admin,
    USER_ROLE.user,
    USER_ROLE.guide,
    USER_ROLE.leadGuide,
  ),
  authController.updatePassword,
);

// user related
userRouter.get('/', userController.getAllUsers);
userRouter.post('/', userController.createUser);
userRouter.get('/:id', userController.getUser);
userRouter.patch('/:id', userController.updateUser);
userRouter.delete('/:id', userController.deleteUser);

module.exports = userRouter;
