/**
 * Created by jeremyt on 15/09/14.
 */

var Racetype = require('../models/racetype');

exports.getAllRacetypes = function() {

    return function (req, res) {
        var query = Racetype.find();
        query.exec(function(err, results) {
            if (err) {
                res.status(400).end();
            }

            res.status(200).json(results);
        });
    };
};

exports.createRacetype = function() {

    return function (req, res) {
        var label = (req.body.label || '').toUpperCase();
        var header_no = (req.body.header_no || '').toUpperCase();
        if (label == '' || header_no == '' ) {
            res.status(400).end();
        }

        var query = Racetype.findOne({label: label});
        query.exec(function(err, result) {
            if (err) {
                res.status(400).end();
            }

            if (result == null) {
                var racetype = new Racetype();
                racetype.label = label;
                racetype.header_no = header_no;
                racetype.save(function(err, result) {
                    if (err) {
                        res.status(500).end();
                    }

                    console.log('--> racetype ('+result.label+') created');
                    res.status(200).json(result);
                });


            } else {
                res.status(400).end();
            }
        });
    };
};

exports.updateRacetype = function() {

    return function (req, res) {
        var label = (req.body.label || '').toUpperCase();
        var header_no = (req.body.header_no || '');
        var id = req.body._id || '';
        if (label == '' || id == '' || header_no == '') {
            return res.status(400).end();
        }

        Racetype.update({_id: id}, {label: label}, {header_no: header_no}, function(err) {
            if (err) {
                res.status(500).end();
            }

            console.log('--> racetype ('+id+') updated');
            res.status(200).end();
        });
    };
};

exports.deleteRacetype = function() {
    return function (req, res) {

        var id = req.params.id;
        if (id == null || id == '') {
            res.status(400).end();
        }

        var query = Racetype.findOne({_id: id});
        query.exec(function(err, result) {
            if (err) {
                res.status(400).end();
            }

            if (result != null) {
                result.remove();
                console.log('--> racetype ('+id+') deleted');
                res.status(200).end();
            }
            else {
                res.status(400).end();
            }

        });
    };
};