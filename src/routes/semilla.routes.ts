import express from 'express';
import SemillaController from '../controllers/semilla.controller';
const tokenValidator = require('../middleware/tokenValidator');

const router = express.Router();

router.use(tokenValidator);

router.get('/getAllSemillas', SemillaController.getAllSemillas);
router.get('/getSemillaById/:id', SemillaController.getSemillaById);
router.put('/updateSemilla/:id', SemillaController.updateSemilla);

export default router;