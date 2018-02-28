// JWT - JsonWebToken
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;



//////////////////////////////////////////////////
//      Verificar TOKEN                         //
//////////////////////////////////////////////////

//Cualquier petición que haya debajo de aquí pasa primero aquí

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'token malo!!',
                errors: err
            });

        }

        req.usuario = decoded.usuario;

        next();

        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });



    });
}