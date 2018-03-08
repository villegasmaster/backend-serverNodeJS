var express = require('express');

var app = express();



// var Hospital = require('../models/hospital');
// var Usuario = require('../models/usuario');
var Medico = require('../models/medico');


//Encriptar pass
// var bcrypt = require('bcryptjs');

// JWT - JsonWebToken
//var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

//Importacion Middlewares 
var mdAutenticacion = require('../middlewares/autenticacion');





// Rutas

//////////////////////////////////////////////////
//      Obtener todos los medicos               //
//////////////////////////////////////////////////

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(

            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos!!',
                        errors: err
                    });

                }

                Medico.count({}, (err, contador) => {

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: contador
                    });
                });
            });


});




//////////////////////////////////////////////////
//      Actualizar  medicos                     //
//////////////////////////////////////////////////

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;


    // verificar si existe el user con id
    Medico.findById(id, (err, medico) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe medico!!',
                errors: err
            });

        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + 'no existe',
                errors: { message: 'No existe medico con ese ID' }
            });
        }


        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico!!',
                    errors: err
                });

            }

            // usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                body: body
            });

        });


    });

});


//////////////////////////////////////////////////
//      Crear un nuevo medico                   //
//////////////////////////////////////////////////

// Se añade por parametro el verificaToken para que haga la comprobacion,
// se pone sin paretesis para que no se ejecute al entrar

app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital

    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error insertando medico!!',
                errors: err
            });

        }

        // El usuarioToken es el que hizo la creación, en este caso el admin
        res.status(201).json({
            ok: true,
            body: medicoGuardado,
            usuarioToken: req.usuario
        });
    });




});



//////////////////////////////////////////////////
//      Eliminar medico                         //
//////////////////////////////////////////////////

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico!!',
                errors: err
            });

        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe medico con ese ID' }
            });
        }

        //usuarioBorrado.password = ':)';

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });


    });

});





module.exports = app;