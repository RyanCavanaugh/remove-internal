#!/usr/bin/env node

import fs = require('fs');
import path = require('path');
import yargs = require('yargs');
import mkdirp = require('mkdirp');
import elider = require('./index');

const cmdLine: any = yargs
    .option('output', {
        alias: 'o',
        default: undefined,
        describe: 'Output filename'
    })
    .option('outdir', {
        default: undefined,
        describe: 'Output directory'
    })
    .strict()
    .parse();

if (cmdLine._.length > 1 && !cmdLine.outdir) {
    console.error('Cannot specify more than one input without "outdir"');
    process.exit(-1);
}

for (const inputFileName of cmdLine._) {
    fs.readFile(inputFileName, { encoding: 'utf-8' }, (err, data) => {
        if (err) throw err;

        const { count, result } = elider.elide(data);

        const outputFileName = cmdLine.output ? cmdLine.output :
            cmdLine.outdir ? path.join(cmdLine.outdir, path.basename(inputFileName)) :
                null;

        if (outputFileName === null) {
            console.log(result);
        } else {
            mkdirp(path.dirname(outputFileName), err => {
                if (err) throw err;
                fs.writeFile(outputFileName, result, { encoding: "utf-8" }, err => { if (err) throw err; });
                console.log(`Wrote ${result.length} characters to ${outputFileName}. Removed ${count} declarations.`);
            });
        }
    });
}
