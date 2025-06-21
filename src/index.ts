// index.ts
import express from 'express';
import dotenv  from 'dotenv';                // 🟢 siempre primero
import cors from 'cors';
dotenv.config();                             // 🟢

import priceRoutes   from './routes/precios.routes';
import empresaRoutes from './routes/empresa.routes';
import usuarioRoutes from './routes/usuario.routes';
import loginRoutes   from './routes/login.routes';
import authRoutes    from './routes/auth.routes';
import inviteCodesRoutes    from './routes/inviteCodes.routes';
import semillaRoutes    from './routes/semilla.routes';
import parcelaRoutes    from './routes/parcela.routes';
import cultivoRoutes    from './routes/cultivo.routes';
import cosechaRoutes    from './routes/cosecha.routes';
import climaRoutes from './routes/clima.routes';
const tokenValidator = require ('./middleware/tokenValidator');
const errorHandler = require ('./middleware/errorHandler');
import { startPriceJob } from './jobs/fetch-precios.job';
import { startAgroNotifyJob } from './jobs/agroNotifications.job';
const initDB = require('../config/db')        

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors()); // ✅ CORS habilitado

// • Middlewares globales
app.use(express.json());
// 🟢 Cargamos SYMBOLS directamente al boot
const symbolsEnv = process.env.SYMBOLS ?? 'CZCUSX,ZSUSX,KEUSX';
const symbols   = symbolsEnv.split(',').map(s => s.trim().toUpperCase());
app.locals.symbols = symbols;

// • Rutas protegidas / públicas
app.use('/empresas', tokenValidator, empresaRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/login',    loginRoutes);
app.use('/auth',     authRoutes);
app.use('/grain',tokenValidator ,priceRoutes);
app.use('/inviteCodes', tokenValidator, inviteCodesRoutes);
app.use('/semillas', semillaRoutes);
app.use('/parcelas', parcelaRoutes);
app.use('/cultivos', cultivoRoutes);
app.use('/cosechas', cosechaRoutes);
app.use('/clima/', tokenValidator, climaRoutes);

app.get('/', (_req, res) => {
  console.log('someone pinged here!!');
  res.send('pong');
});

// • Error handler SIEMPRE al final
app.use(errorHandler);

// • Arranque controlado: conecta Mongo ➜ inicia server ➜ lanza cron
(async () => {                                  // 🟢 IIFE async
  try {
    await initDB();                             // 🟢 espera Mongo
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startPriceJob(symbols); // 🟢 symbols ya existen
      startAgroNotifyJob();
    });
  } catch (err) {
    console.error('Failed to start app:', err);
    process.exit(1);
  }
})();

export { app };                                 // 🟢 export nombrado