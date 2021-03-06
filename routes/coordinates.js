/**
 * Created by jeremyt on 15/09/14.
 */

//to be replace by redis storage
var redisClient = require('../config/redis_database').redisClient;

exports.getCoordinates = function() {

    return function (req, res) {
        redisClient.hmget('prescoords', 'lat', 'long', 'date', function (err, reply) {
            if (err) {
                console.log(err);
                return res.status(500).end();
            }

            if(reply != null) {
                var coords = {};
                coords.lat = Number(reply[0]);
                coords.long = Number(reply[1]);
                coords.dat = Number(reply[2]);

                res.status(200).json(coords);
            }
            else {
                return res.status(400).end();
            }
        });

    };
};

exports.updateCoordinates = function() {

    return function (req, res) {
        var lat = req.body.lat || '';
        var long = req.body.long || '';
        if (lat == '' || long == '') {
            res.status(400).end();
        }

        var d = new Date();

        redisClient.hmset('prescoords', 'lat', lat, 'long', long, 'date', d.getTime(), function(error, result) {
            console.log('--> redis update: '+result);
            res.status(200).end();
        });
    };
};