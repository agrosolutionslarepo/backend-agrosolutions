import express from 'express';
import UsuarioController from '../controllers/usuario.controller';
const tokenValidator = require ('../middleware/tokenValidator');

const router = express.Router();

// Rutas para la entidad Usuario
router.post('/registrarse', UsuarioController.registrarse); // funciona
router.post('/solicitarReset', UsuarioController.solicitarReset);
router.post('/confirmarReset', UsuarioController.confirmarReset);
router.use(tokenValidator);
router.post('/pushToken', UsuarioController.saveExpoToken);
router.get('/notificaciones', UsuarioController.getUltimasNotificaciones);
router.put('/updatePassword', UsuarioController.updateContraseña);
router.put('/deleteUsuario', UsuarioController.deleteUsuario);
router.put('/updateUsuario', UsuarioController.updateUsuario);
router.get('/getUsuariosMismaEmpresa', UsuarioController.getUsuariosMismaEmpresa);
router.get('/getUsuarioAutenticado', UsuarioController.getUsuarioAutenticado);
router.put('/deleteUsuarioDeMiEmpresa/:id', UsuarioController.deleteUsuarioDeMiEmpresa);

export default router;