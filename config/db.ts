import dotenv from 'dotenv';
const mongoose = require('mongoose');

dotenv.config(); // Asegura que las variables del .env sean cargadas

const DB_URI = process.env.DB_URI as string;

if (!DB_URI) {
    console.error("Falta la variable DB_URI en el archivo .env");
    process.exit(1); // Terminar la ejecución si no está definida
}

module.exports = async () => {
    const connect = async () => {
        try {
            await mongoose.connect(DB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                sanitizeFilter: true
            });
            console.log('Conexión correcta a la base de datos');
        } catch (err) {
            console.error('DB: ERROR', err);
        }
    };
    await connect();
};