#!/usr/bin/env node

/**
 * Created by zhs007 on 15/10/25.
 */

var fs = require('fs');
var process = require('process');
var glob = require('glob');
var argv = require('yargs')
    .usage('Usage: pathanalyze path')
    .example('pathanalyze [path]', 'analyze [path]')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2015')
    .argv;

var basearr = argv._;

if (basearr == undefined || basearr.length != 1) {
    console.log('Usage: pathanalyze [path]');

    process.exit(1);
}

var jsonobj = {children: {}, filenums: 0, totalsize: 0, mysize: 0, filetype: {}, type: 'path'};

function addpaths(obj, paths, size) {
    if (paths.length > 1) {
        var tobj = obj;
        for (var i = 0; i < paths.length - 1; ++i) {
            if (!tobj.children.hasOwnProperty(paths[i])) {
                tobj.children[paths[i]] = {children: {}, filenums: 0, totalsize: 0, mysize: 0, filetype: {}, type: 'path'};
            }

            tobj.children[paths[i]].filenums++;
            tobj.children[paths[i]].totalsize += size;

            if (i == paths.length - 2) {
                tobj.children[paths[i]].mysize += size;
            }

            tobj = tobj.children[paths[i]];
        }
    }

    if (paths.length >= 1) {
        var tobj = obj;
        for (var i = 0; i < paths.length - 1; ++i) {
            tobj = tobj.children[paths[i]];
        }

        if (!tobj.children.hasOwnProperty(paths[paths.length - 1])) {
            tobj.children[paths[paths.length - 1]] = {children: {}, filenums: 0, totalsize: 0, mysize: 0, filetype: {}, type: 'file'};
        }

        tobj.children[paths[paths.length - 1]].filenums++;
        tobj.children[paths[paths.length - 1]].totalsize = size;
        tobj.children[paths[paths.length - 1]].mysize = size;
    }

    return obj;
}

function addfiletype(obj, paths, size) {
    if (paths.length >= 1) {
        var tobj = obj;
        for (var i = 0; i < paths.length - 1; ++i) {
            if (!tobj.children.hasOwnProperty(paths[i])) {
                tobj.children[paths[i]] = {children: {}, filenums: 0, totalsize: 0, mysize: 0, filetype: {}, type: 'path'};
            }

            tobj = tobj.children[paths[i]];
        }
    }

    if (paths.length > 0) {
        var ft = '_';
        var tn = paths[paths.length - 1].toLowerCase();
        var si = tn.indexOf('.');
        if (si >= 0) {
            ft = tn.slice(si);
        }

        var tobj = obj;
        for (var i = 0; i < paths.length; ++i) {
            if (!tobj.filetype.hasOwnProperty(ft)) {
                tobj.filetype[ft] = {filenums: 0, totalsize: 0};
            }

            tobj.filetype[ft].filenums++;
            tobj.filetype[ft].totalsize += size;

            if (i < paths.length - 1) {
                tobj = tobj.children[paths[i]];
            }
        }
    }

    return obj;
}

function addfile(obj, filename, size) {
    var paths = filename.split('/');
    obj = addpaths(obj, paths, size);
    obj = addfiletype(obj, paths, size);

    return obj;
}

function procfile(obj, filename) {
    var s = fs.statSync(filename);

    return addfile(obj, filename, s.size);
}

var lstfile = glob.sync(basearr[0]);
for (var i = 0; i < lstfile.length; ++i) {
    var srcfile = lstfile[i];

    if (fs.existsSync(srcfile)) {
        jsonobj = procfile(jsonobj, srcfile);
    }

    console.log(srcfile + ' OK!');
}

fs.writeFileSync('output.json', JSON.stringify(jsonobj));