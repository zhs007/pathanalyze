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

var lstfile = glob.sync(basearr[0]);
for (var i = 0; i < lstfile.length; ++i) {
    var srcfile = lstfile[i];

    if (fs.existsSync(srcfile)) {
        var srcbuf = fs.readFileSync(srcfile);
        var srcbom = hasBOM(srcbuf);
        if (srcbom) {
            if (srccharset != 'utf8') {
                console.log('Err: ' + srcfile + ' charset is utf8-bom');

                continue;
            }

            srcbuf = cutBOM(srcbuf);
        }

        if (checkCharset(srcbuf, srccharset)) {
            var destbuf = chgCharset(srcbuf, srccharset, destcharset);

            if (bom) {
                fs.writeFileSync(srcfile, addBOM(destbuf));
            }
            else {
                fs.writeFileSync(srcfile, destbuf);
            }
        }
        else {
            console.log('Err: ' + srcfile + ' charset is not ' + srccharset);

            continue;
        }
    }

    console.log(srcfile + ' OK!');
}
