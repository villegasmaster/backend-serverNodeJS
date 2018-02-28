var express = require('express');

var app = express();



var Usuario = require('../models/usuario');

//Encriptar pass
var bcrypt = require('bcryptjs');

// JWT - JsonWebToken
var jwt = require('jsonwebtoken');

// var SEED = require('../config/config').SEED;

//Importacion Middlewares 
var mdAutenticacion = require('../middlewares/autenticacion');





// Rutas

//////////////////////////////////////////////////
//      Obtener todos los usuarios              //
//////////////////////////////////////////////////

app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec(

            (err, usuarios) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario!!',
                        errors: err
                    });

                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });
            });


});




//////////////////////////////////////////////////
//      Actualizar los usuarios                 //
//////////////////////////////////////////////////

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;


    // verificar si existe el user con id
    Usuario.findById(id, (err, usuario) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe usuario!!',
                errors: err
            });

        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }


        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {


            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario!!',
                    errors: err
                });

            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });

        });


    });

});


//////////////////////////////////////////////////
//      Crear un nuvo usuario                   //
//////////////////////////////////////////////////

// Se añade por parametro el verificaToken para que haga la comprobacion,
// se pone sin paretesis para que no se ejecute al entrar

app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role

    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error insertando usuario!!',
                errors: err
            });

        }

        // El usuarioToken es el que hizo la creación, en este caso el admin
        res.status(201).json({
            ok: true,
            body: usuarioGuardado,
            usuarioToken: req.usuario
        });
    });




});

//////////////////////////////////////////////////
//      Eliminar usuarios                       //
//////////////////////////////////////////////////

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    var body = req.body;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {


        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario!!',
                errors: err
            });

        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe usuario con ese ID' }
            });
        }

        usuarioBorrado.password = ':)';

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });


    });

});



module.exports = app;