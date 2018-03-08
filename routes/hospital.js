var express = require('express');

var app = express();



var Hospital = require('../models/hospital');
//var Usuario = require('../models/usuario');


//Encriptar pass
// var bcrypt = require('bcryptjs');

// JWT - JsonWebToken
//var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

//Importacion Middlewares 
var mdAutenticacion = require('../middlewares/autenticacion');





// Rutas

//////////////////////////////////////////////////
//      Obtener todos los hospitales            //
//////////////////////////////////////////////////

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(

            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales!!',
                        errors: err
                    });

                }

                Hospital.count({}, (err, contador) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: contador
                    });
                });
            });


});




//////////////////////////////////////////////////
//      Actualizar  hospitales               //
//////////////////////////////////////////////////

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;


    // verificar si existe el user con id
    Hospital.findById(id, (err, hospital) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe hospital!!',
                errors: err
            });

        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }


        hospital.nombre = body.nombre;
        //hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital!!',
                    errors: err
                });

            }

            // usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado,
                body: body
            });

        });


    });

});


//////////////////////////////////////////////////
//      Crear un nuevo hospital                 //
//////////////////////////////////////////////////

// Se añade por parametro el verificaToken para que haga la comprobacion,
// se pone sin paretesis para que no se ejecute al entrar

app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id

    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error insertando hospital!!',
                errors: err
            });

        }

        // El usuarioToken es el que hizo la creación, en este caso el admin
        res.status(201).json({
            ok: true,
            body: hospitalGuardado

        });
    });




});



//////////////////////////////////////////////////
//      Eliminar usuarios                       //
//////////////////////////////////////////////////

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital!!',
                errors: err
            });

        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe hospital con ese ID' }
            });
        }

        //usuarioBorrado.password = ':)';

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });


    });

});





module.exports = app;