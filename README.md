# sentiment-multilanguage
Fork of the Sentiment module, with multi-language support (so far I am translating the AFINN file with an utility that I have created), present in this repo.

# AFINN file command-line translator

Use this command to create more translations of the AFINN.json file (some translations are already included in the afinn folder)

 ```node translate.js```

 You will need to obtain keys for the Bing Translator API, here:
 http://www.microsoft.com/en-us/translator/getstarted.aspx

 Add your credentials using the command line tool:

  ```node translate.js -c```

### Bugs

There is a bug in one of the dependencies:
https://github.com/bdswiss/country-language/issues/2

If you're finding this issue, please edit the file yourself (if the module's author hasn't fixed it yet!)

### TODO

Yes... testing!