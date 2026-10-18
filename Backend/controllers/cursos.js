// import { connection } from '../configs/database.js';

// const mostrarCursos = (req, res) => {
//     connection.query('SELECT * FROM cursos', (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Error al obtener los cursos' });
//         }
//         res.status(200).json(results);
//     });
// }

// const mostrarCurso = (req, res) => {
//     const { id } = req.params;
//     connection.query('SELECT * FROM cursos WHERE id_curso = ?', [id], (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Error al obtener el curso' });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'Curso no encontrado' });
//         }
//         res.status(200).json(results[0]);
//     });
// };

// const crearCurso = (req, res) => {
//     const { nombre, descripcion } = req.body;
//     if ( !nombre || !descripcion ) {
//         return res.status(400).json({error: 'Faltan datos requeridos'});
//     };
//     if (typeof nombre !== 'string' || typeof descripcion !== 'string') {
//         return res.status(400).json({ error: 'Tipo de dato incorrecto' });
//     }
//     connection.query('INSERT INTO cursos (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion], (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Error al crear el curso' });
//         }
//         res.status(201).json({ mensaje: 'Curso creado con éxito', id_curso: results.insertId, nombre, descripcion });
//     });
// };

// const actualizarCurso = (req, res) => {
//     const { id } = req.params;
//     const { nombre, descripcion } = req.body;
//     if (!id || !nombre || !descripcion) {
//         return res.status(400).json({ error: 'Faltan datos requeridos' });
//     }
//     connection.query('UPDATE cursos SET nombre = ?, descripcion = ? WHERE id_curso = ?', [nombre, descripcion, id], (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Error al actualizar el curso' });
//         }
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ error: 'Curso no encontrado' });
//         }
//         res.status(200).json({ message: 'Curso actualizado con éxito' });
//     });
// };

// const eliminarCurso = (req, res) => {
//     const { id } = req.params;
//     connection.query('DELETE FROM cursos WHERE id_curso = ?', [id], (error, results) => {
//         if (error) {
//             return res.status(500).json({ error: 'Error al eliminar el curso' });
//         }
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ error: 'Curso no encontrado' });
//         }
//         res.status(200).json({ message: 'Curso eliminado con éxito' });
//     });
// };

// export default { mostrarCursos, mostrarCurso, crearCurso, actualizarCurso, eliminarCurso };