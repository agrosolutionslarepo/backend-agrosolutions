import express from 'express';
import CosechaController from '../controllers/cosecha.controller';
const tokenValidator = require('../middleware/tokenValidator');

const router = express.Router();

router.use(tokenValidator);

router.get('/getAllCosechas', CosechaController.getAllCosechas);
router.get('/getCosechaById/:id', CosechaController.getCosechaById);
router.post('/createCosecha', CosechaController.createCosecha);
router.put('/updateCosecha/:id', CosechaController.updateCosecha);
router.delete('/deleteCosecha/:id', CosechaController.deleteCosecha);

export default router;