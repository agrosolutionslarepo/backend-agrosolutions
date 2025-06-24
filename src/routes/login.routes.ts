import express from 'express';
import LoginController from '../controllers/login.controller';

const router = express.Router();

router.post('/', LoginController.loguear);
router.post('/google/token', LoginController.loginConGoogle);

export default router;