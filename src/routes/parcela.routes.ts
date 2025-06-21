import express from 'express';
import ParcelaController from '../controllers/parcela.controller';
const tokenValidator = require('../middleware/tokenValidator');

const router = express.Router();

router.use(tokenValidator);

router.get('/getAllParcelas', ParcelaController.getAllParcelas);
router.get('/getParcelaById/:id', ParcelaController.getParcelaById);
router.post('/createParcela', ParcelaController.createParcela);
router.put('/updateParcela/:id', ParcelaController.updateParcela);
router.delete('/deleteParcela/:id', ParcelaController.deleteParcela);

export default router;