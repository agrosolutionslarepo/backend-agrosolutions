import { Router } from 'express';
import ClimaController  from '../controllers/clima.controller';

const router = Router();

router.get('/current', ClimaController.currentWeather);       // ?lat=-34.6&lon=-58.4
router.get('/minute',  ClimaController.minutalPrecip);        // idem
router.get('/historic', ClimaController.powerHistoric);       // ?lat&lon&start=20250101&end=20250131

export default router;
