/*jshint node:true */
'use strict';
module.exports = function (gadgetPath, callback) {
    var Zip = require('zip-archiver');
    var Temp = require('temp');
    var Fs = require('fs');

    var write = function (data) {
        process.stdout.write(new Buffer(data).toString("utf-8"));
    };

    Temp.mkdir('resilience-gadget', function(err, dirPath) {
        if (err) { throw err; }
        var outName = dirPath + '/' + gadgetPath.replace(/.*\//, '') + '.zip';
        var file = new Zip.Zip({ file: outName  });
        var lastdir = process.cwd();
        process.chdir(gadgetPath);
        file.add('.', function () {
            file.done();
            process.chdir(lastdir);
            callback(outName);
        });
    });
};
