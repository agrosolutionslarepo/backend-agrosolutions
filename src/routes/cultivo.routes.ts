import express from 'express';
import CultivoController from '../controllers/cultivo.controller';
const tokenValidator = require('../middleware/tokenValidator');

const router = express.Router();

router.use(tokenValidator);

// Rutas para la entidad Cultivo
router.get('/getAllCultivos', CultivoController.getAllCultivos);
router.get('/getCultivoById/:id', CultivoController.getCultivoById);
router.post('/createCultivo', CultivoController.createCultivo);
router.put('/updateCultivo/:id', CultivoController.updateCultivo);
router.delete('/deleteCultivo/:id', CultivoController.deleteCultivo);

export default router;
