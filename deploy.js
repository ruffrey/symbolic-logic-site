var glob = require("glob")
var async = require('async');
var fs = require('fs');
var gcloud = require('gcloud');
var path = require('path');
var log = console.log;

// Authorizing on a per-API-basis. You don't need to do this if you auth on a
// global basis (see Authorization section above).

var gcs = gcloud.storage({
    keyFilename: path.normalize(__dirname + '/../gcloud.json'),
    projectId: 'symbolic-logic-website'
});

// Reference an existing bucket.
var bucket = gcs.bucket('symboliclogic.io');


glob(__dirname + '/build/**/*', { nodir: true }, function (err, files) {
    if (err) {
        log(err.message, err.stack);
        return;
    }
    log(files.length, 'files to upload.');
    async.mapSeries(files, function (file, cb) {
        var dest = file.replace(__dirname + '/build/', '');
        var gFile = bucket.file(dest);
        log('Uploading', file, 'to', dest);
        bucket.upload(file, {
            destination: gFile
        }, function (err) {
            if (err) { log('ERROR', file, err.message); }
            else { log('Success', file); }
            cb(err);
        });
    }, function (err) {
        if (err) { log(err.message, err.stack); }
        else { log('Successfully uploaded files.'); }
    });
});
