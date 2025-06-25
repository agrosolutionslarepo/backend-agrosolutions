import { Request, Response, NextFunction } from 'express';
import { empresaService } from '../services/empresa.service';
import { HttpError } from '../errors/HttpError';

class EmpresaController {

  public async updateEmpresa(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const idEmpresa = req.user?.idEmpresa;

    if (!idEmpresa) {
      return next(new HttpError(400, 'ID de empresa no encontrado en el token'));
    }

    try {
      const empresaActualizada = await empresaService.updateEmpresa(idEmpresa, req.body);
      return res.status(200).json(empresaActualizada);
    } catch (error: any) {
      next(error);
    }
  }

  public async getNombreEmpresa(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const idEmpresa = req.user?.idEmpresa;

    if (!idEmpresa) {
      return next(new HttpError(400, 'ID de empresa no encontrado en el token'));
    }

    try {
      const nombre = await empresaService.getNombreEmpresa(idEmpresa);
      return res.status(200).json({ nombreEmpresa: nombre });
    } catch (error: any) {
      next(error);
    }
  }

  public async deleteEmpresa(req: Request, res: Response, next: NextFunction) {
    try {
      const idEmpresa = req.user?.idEmpresa;

      if (!idEmpresa) {
        return next(new HttpError(400, 'ID de empresa no encontrado en el token'));
      }

      const empresaEliminada = await empresaService.deleteEmpresa(idEmpresa);

      if (!empresaEliminada) {
        return next(new HttpError(404, 'Empresa no encontrada'));
      }

      return res.status(200).json({
        message: 'Empresa eliminada correctamente',
        empresa: empresaEliminada,
      });
    } catch (error) {
      next(error);
    }
  }

  public async crearEmpresaDesdeGoogle(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    const idEmpresaActual = req.user?.idEmpresa;
    const idEmpresaFicticia = '6840da01ba52fec6d68de6bc';

    if (!idEmpresaActual || idEmpresaActual !== idEmpresaFicticia) {
      return next(new HttpError(403, 'No autorizado para crear empresa desde esta ruta'));
    }

    const { nombreEmpresa } = req.body;
    if (!nombreEmpresa || typeof nombreEmpresa !== 'string') {
      return next(new HttpError(400, 'nombreEmpresa es requerido y debe ser string'));
    }

    try {
      const { empresa, jwt } = await empresaService.crearEmpresaDesdeGoogle(nombreEmpresa, req.user.id);
      return res.status(201).json({ empresa, jwt });
    } catch (error: any) {
      next(error);
    }
  }
  
}

export default new EmpresaController();
