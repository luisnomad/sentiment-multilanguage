bing-translate
==============

## Original plugin
This is a fork of https://github.com/alexu84/bing-translate

Bing Translator module for node.js

## Installation

This will install the original plugin without the modifications I have added to my forked project:

```js
$ npm install bing-translate
```

If you wish to use my version, then clone this repository in a subfolder within your project, and use "require".

## API

```js
var bt = require('./lib/bing-translate.js').init({
    client_id: 'your_client_id', 
    client_secret: 'your_client_secret'
  });

bt.translate('This hotel is located close to the centre of Paris.', 'en', 'ro', function(err, res){
  console.log(err, res);
});
```

## Language List Reference

Please refer to [this link](https://msdn.microsoft.com/en-us/library/hh456380.aspx) for the
complete list of the languages supported by BING.