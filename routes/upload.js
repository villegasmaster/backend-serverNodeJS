var express = require('express');

var app = express();

// FileUpload
const fileUpload = require('express-fileupload');

//FileSystem
var fs = require('fs');

// default options
app.use(fileUpload());

//Modelo
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');





// Rutas

// Se le pasa el tipo de archivo y el id del user

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valido!!',
            errors: { message: 'El tipo valido es' + tiposValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada!!',
            errors: { message: 'No seleccionó nada' }
        });


    }

    // Obtener nombre archivo
    var archivo = req.files.imagen;
    var name = archivo.name.split('.');
    var extension = name[name.length - 1].toLowerCase();

    // Extensiones validas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no valida!!',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Cambiar nombre archivo para personalizarlo
    // 11646434654644-random.extension
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    // Mover un archivo de un temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, err => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo!!',
                errors: err
            });
        }


        subirPorTipo(tipo, id, nombreArchivo, res);



        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extension: extension,
        //     nombrePersonalizado: nombreArchivo
        // });

    });


});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe la imagen, elimina la anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });


            });
        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe la imagen, elimina la anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });


            });
        });
    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe la imagen, elimina la anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });


            });
        });
    }

}

module.exports = app;