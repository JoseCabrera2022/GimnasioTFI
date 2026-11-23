import './configs/env.js';
import express from 'express';
import cors from 'cors';

//import cursos from './routers/cursos.js';
import pagosRoutes from './routers/pagosRoutes.js';
import authRoutes from './routers/authRoutes.js';
import oauthRoutes from './routers/oauthRoutes.js';
import planesRoutes from './routers/planesRoutes.js';
import contactoRoutes from './routers/contactoRoutes.js'
import perfilRoutes from './routers/perfilRoutes.js'
import membresiasRoutes from './routers/membresiasRoutes.js';
import reservasRoutes from './routers/reservasRoutes.js'
import actividadesRoutes from './routers/actividadesRoutes.js'
import ubicacionesRoutes from './routers/ubicacionesRoutes.js';
import usuarioRoutes from './routers/usuarioRoutes.js'
import turnosRoutes from './routers/turnosRoutes.js'
import reportesRoutes from './routers/reportesRoutes.js'
import empleadoRoutes from './routers/empleadoRoutes.js'
import { expirarReservasVencidas } from './services/reservasService.js';

const app = express();

//middlewares
app.use(express.json());
app.use(cors({ exposedHeaders: ['X-Auth-Token'] }));

//app.use('/', cursos);
app.use('/api/pagos', pagosRoutes);
app.use('/', authRoutes);
app.use('/', oauthRoutes);
app.use('/', planesRoutes);
app.use('/', contactoRoutes);
app.use('/', perfilRoutes);
app.use('/', membresiasRoutes);
app.use('/', reservasRoutes);
app.use('/', actividadesRoutes);
app.use('/', ubicacionesRoutes);
app.use('/', usuarioRoutes);
app.use('/', turnosRoutes);
app.use('/', reportesRoutes);
app.use('/', empleadoRoutes);

// Para servir las imágenes subidas
app.use('/uploads', express.static('uploads'));

//routes
app.get('/', (req,res) => {
    res.send('Hola mundo');
});

let expiracionEnCurso = false;
const procesarReservasVencidas = async () => {
    if (expiracionEnCurso) return;
    expiracionEnCurso = true;
    try {
        const cantidad = await expirarReservasVencidas();
        if (cantidad > 0) {
            console.log(`Reservas expiradas automáticamente: ${cantidad}`);
        }
    } catch (error) {
        console.error('Error al expirar reservas automáticamente:', error);
    } finally {
        expiracionEnCurso = false;
    }
};

void procesarReservasVencidas();
const expiracionReservasTimer = setInterval(procesarReservasVencidas, 60_000);
expiracionReservasTimer.unref();

app.listen(8000, () =>{
    console.log('Servidor corriendo en el puerto 8000')
});