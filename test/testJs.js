path = require("path");
const extractZh = require('./../dist');

const filePathHtml = path.normalize(__dirname + './../zh/index.html');
const filePathJs = path.normalize(__dirname + './../zh/js.js');
const filePathScss = path.normalize(__dirname + './../zh/scss.scss');
const extract = new extractZh();

extract.readFileByLine(filePathHtml);
// extract.readFileByLine(filePathJs);
// extract.readFileByLine(filePathScss);
