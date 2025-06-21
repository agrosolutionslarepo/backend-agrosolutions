import { Request, Response, NextFunction } from 'express';
import { cosechaService } from '../services/cosecha.service';
import { HttpError } from '../errors/HttpError';

class CosechaController {
  public async getAllCosechas(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) {
        return next(new HttpError(401, 'ID de empresa no encontrado en el token'));
      }

      const cosechas = await cosechaService.getAllCosechas(idEmpresa);
      res.json(cosechas);
    } catch (error) {
      next(error);
    }
  }

  public async getCosechaById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) {
        return next(new HttpError(401, 'ID de empresa no encontrado en el token'));
      }

      const cosecha = await cosechaService.getCosechaById(req.params.id, idEmpresa);
      res.json(cosecha);
    } catch (error) {
      next(error);
    }
  }

  public async createCosecha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) {
        return next(new HttpError(401, 'ID de empresa no encontrado en el token'));
      }

      const cosecha = await cosechaService.createCosecha(req.body, idEmpresa);
      res.status(201).json(cosecha);
    } catch (error) {
      next(error);
    }
  }

  public async updateCosecha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) {
        return next(new HttpError(401, 'ID de empresa no encontrado en el token'));
      }

      const updated = await cosechaService.updateCosecha(
        req.params.id,
        req.body,
        idEmpresa
      );
      res.json(updated);
    } catch (error) {
      next(error);
    }
  }

  public async deleteCosecha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const idEmpresa = req.user?.idEmpresa;
      if (!idEmpresa) {
        return next(new HttpError(401, 'ID de empresa no encontrado en el token'));
      }

      const eliminado = await cosechaService.deleteCosecha(
        req.params.id,
        idEmpresa
      );
      res.status(200).json({ message: 'Cosecha eliminada', cosecha: eliminado });
    } catch (error) {
      next(error);
    }
  }
}

export default new CosechaController();
