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

const app = express();

//middlewares
app.use(express.json());
app.use(cors());

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

// Para servir las imágenes subidas
app.use('/uploads', express.static('uploads'));

//routes
app.get('/', (req,res) => {
    res.send('Hola mundo');
});

app.listen(8000, () =>{
    console.log('Servidor corriendo en el puerto 8000')
});