import { Request, Response, NextFunction } from 'express';
import { climaService } from '../services/clima.service';
import { LatLongRequiredError } from '../errors/climaError';

class ClimaController {

public async currentWeather(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) throw new LatLongRequiredError();

    const obs   = await climaService.getSmnCurrent(Number(lat), Number(lon));
    const agro  = await climaService.getOpenMeteoAgro(Number(lat), Number(lon), 7);

    res.json({ obs, agro });
  } catch (e) { next(e); }
}

public async minutalPrecip(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) if (!lat || !lon) throw new LatLongRequiredError();

    const data = await climaService.getTomorrowMinute(Number(lat), Number(lon));
    res.json(data);
  } catch (e) { next(e); }
}

public async powerHistoric(req: Request, res: Response, next: NextFunction) {
  try {
    const { lat, lon, start, end } = req.query;
    if (!lat || !lon || !start || !end) throw new LatLongRequiredError();

    const hist = await climaService.getPowerDaily(
      Number(lat), Number(lon), String(start), String(end)
    );
    res.json(hist);
  } catch (e) { next(e); }
}
}

export default new ClimaController();