#!/usr/bin/env node
/*global, require, console, module, exports, __dirname */

/**
 * Module dependencies.
 */

var program = require('commander');
var prompt = require('prompt');
var fs = require("fs");
var countryLanguage = require('country-language');
require('console.table');

var path = require('path');
global.appRoot = path.resolve(__dirname);

program
    .version('0.0.1')
    .option('-c, --setcredentials', 'set big translator API credentials')
    .option('-l, --outputlanguage [lang]', "Output language")
    .option('-L, --inputlanguage [lang]', "Input language (default is 'en')")
    .option('-f, --outputfolder [folder]', "Output folder. Defaults to ./afinn")
    .option('-F, --inputfolder [folder]', "Input folder. Defaults to ./afinn")
    .option('-i, --inputfile [file]', "Input file. Defaults to AFFIN.json")
    .option('-C, --codes [type]', "Shows valid code languages in selected type: 1 for ISO-639-1 (default), 2 for ISO-639-2 or 3 for ISO-639-3")
    .parse(process.argv);

/** Setting Credentials **/
if (program.setcredentials) {
    var properties = [
        {
            name: 'client_id'
        },
        {
            name: 'client_secret'
        }
    ];

    prompt.start();

    prompt.get(properties, function (err, result) {
        if (err) {
            return onErr(err);
        }

        var credentials = {
            client_id: result.client_id,
            client_secret: result.client_secret
        };

        fs.writeFile('./lib/bingcredentials.json', JSON.stringify(credentials), function (err) {
            if (err) {
                console.log("Couldn't write file...");
                throw err;
            }
            console.log('Credentials file created!');
        });
    });

    function onErr(err) {
        console.log(err);
        return 1;
    }
} else if (program.codes) {
    var code = program.codes || "1";
    countryLanguage.getLanguageCodes(code, function showCodes(error, result) {
        var tableRow = [];
        for (var code of result)
        {
            // console.log (code);
            countryLanguage.getLanguage(code, function (err, language) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log (JSON.stringify(language));
                    //console.log("Code '" + code + "' is for the " + language.name + " language, spoken in:");

                    if (language.countries.length > 0) {
                        for (var country of language.countries) {
                            tableRow.push ({
                                countryCode: code,
                                spoken:  country.name
                            });
                            //tableRow[0].spoken = tableRow[0].spoken + country.name + ", ";
                            //console.log ("- " + country.name);
                        }
                    } else {
                        tableRow.push({
                            countryCode: code,
                            spoken: "N/A"
                        });
                    }
                    tableRow.push({
                        countryCode: "",
                        spoken: ""
                    });
                }
            });


        }

        console.table(tableRow);

    });


} else if (program.outputlanguage) {

    var options = {
        inputLanguage: program.inputlanguage || 'en',
        outputLanguage: program.outputlanguage,
        inputFolder: program.inputfolder || appRoot + '/afinn/',
        outputFolder: program.outputfolder || appRoot + '/afinn/',
        inputFile: program.inputfile || 'AFINN.json'
    };

    var translation = require("./lib/translation")(options);

    translation.translate();


} else {
    console.log("Please specify an output language (or -h for help)");
}

