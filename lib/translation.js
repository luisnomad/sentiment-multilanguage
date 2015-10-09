/*global require, console, module, exports */
"use strict";
var cursor = require('ansi')(process.stdout);
var fs = require('fs');

var Translation = function (options) {

    var credentialsFile = './bingcredentials.json';

    if (fileExists(credentialsFile)) {
        console.log('Bing Credentials file doesn\'t exist! (bingcredentials.json)\nType node translate -c to create one now.', err.code);
        return;
    };

    var translations = {};
    var inputLanguageCode = options.inputLanguage || 'es';
    var outputLanguageCode = options.outputLanguage;
    var outputFolder = options.outputFolder || appRoot + '/afinn/';
    var inputFile = (options.inputFile ? (options.inputFolder ? options.inputFolder + options.inputFile : options.inputFile) : appRoot + '/afinn/AFFIN.json');
    var outputFile = options.outputFile || outputFolder + "AFINN." + outputLanguageCode + ".json";

    var credentials = require (credentialsFile);
    var bt = require('./bing-translate').init(credentials);

    var data = require(inputFile);

    /**
     *
     * @param filePath
     * @returns {*}
     */
    function fileExists(filePath)
    {
        try
        {
            return fs.statSync(filePath).isFile();
        }
        catch (err)
        {
            return false;
        }
    }

    /**
     *
     * @param err
     * @param language_code
     */
    function finished(err, language_code) {

        cursor.show().write('\n');

        if (err) {
            console.log("Error! " + err);
            return;
        }

        console.log("Translations finished! Writing file " + outputFile);

        fs.writeFile(outputFile, JSON.stringify(translations), function (err) {
            if (err) {
                console.log("Couldn't write file...");
                throw err;
            }
            console.log('It\'s saved!');
        });
    }

    /**
     *
     * @param collection
     * @param callback
     */
    function doTranslations(collection, callback) {

        var arr = Object.keys(collection).map(function (k) {
            return k;
        });
        var wordNumber = arr.length;

        translateItem(arr[0], 0, wordNumber, callback);

        /**
         *
         * @param word
         * @param index
         * @param length
         * @param callback
         */
        function translateItem(word, index, length, callback) {

            var abort = false;

            try {
                bt.translate(word, inputLanguageCode, outputLanguageCode, function (err, res) {
                    if (err) {
                        // callback(err);
                        console.log("Word couldn't be translated: '" + word + "'");
                        if (typeof err === "object") {

                            if (err.response && (err.response.indexOf("token") !== -1 && err.response.indexOf("expired") !== -1)) {
                                // New token needed!
                                console.log("Token expired. Getting a new one...");
                                bt.getToken(bt.credentials, function (tokenError, token) {

                                    if (tokenError) {
                                        console.log("Error refreshing token:" + tokenError);
                                        finished(tokenError);
                                        return;
                                    }

                                    // try again!
                                    bt.cachedToken = token;
                                    translateItem(arr[index], index, length, callback);
                                });

                                // Interrupt recursive chain
                                abort = true;
                            } else {
                                console.log(JSON.stringify(err));
                            }
                        } else {
                            console.log(err);
                        }
                    }

                    if (!abort) {
                        if (!err) {
                            process.stdout.write("[" + getPercentage() + "%] Translation for '" + word + "': " + res.translated_text + "                             \r");
                            translations[res.translated_text] = collection[word];
                        }

                        index++;
                        if (index === length) {
                            callback(null, res.to_language);
                        } else {
                            translateItem(arr[index], index, length, callback);
                        }
                    }
                });
            } catch (ex) {
                console.log(ex);
            }
            /**
             *
             * @returns {string}
             */
            function getPercentage() {
                return (((index + 1) / length) * 100).toFixed(2);
            }
        }
    }

    process.on('exit', function () {
        cursor.show().write('\n');
    });

    process.on('SIGINT', function () {
        console.log("Cancelled!")
        cursor.show().write('\n');

        process.exit();
    });


    return {
        translate: function () {
            bt.getToken(bt.credentials, function (err, token) {

                cursor.show().write('\n');

                if (err) {
                    console.log("Error getting token:" + err);
                    finished(err);
                    return;
                }

                console.log("Token: " + JSON.stringify(token));
                bt.cachedToken = token;
                cursor.hide();
                doTranslations(data, finished);
            });
        }
    }
};

/**
 * Expose `Translation`.
 */
module.exports = Translation;


