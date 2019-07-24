# 提取中文字符串

## extract-zh
Use the ts implementation to extract the Chinese strings in the project (or under the specified path) and export them as excel/ CSV /json

## Installation
```
  npm i extract-zh --save
```
## usage

```
path = require("path");

//import extract-zh
const extractZh = require('extract-zh');
// instantiation
const extract = new extractZh();

/**
 * export file
 * call exportZh fn to extract chinese string in your project or under ths specified path 
 * parm1 extractPath(a string value): the path you want to extract the Chinese string, if you don't pass, it default value is your root path
 * param2 exportType(a string value,one of the 'excel'、'json'、'csv'): the file type you want to export. if you don't pass, it default value is 'excel'
 * param3 filterAnnotation(a boolean): Whether to filter Chinese strings in ur annotated code
 * */
extract.exportZh(filePathHtml, 'excel', false);

```

## Demo online 
https://codesandbox.io/s/eager-monad-hn85o
