path = require("path");
const extractZh = require('./../dist');

const filePathHtml = path.normalize(__dirname + './../zh/');
const filePathJs = path.normalize(__dirname + './../zh/js.js');
const filePathScss = path.normalize(__dirname + './../zh/scss.scss');
const extract = new extractZh();
const str = '带我去多群';
extract.exportZh(filePathHtml);
// extract.readFileByLine(filePathJs);
// extract.readFileByLine(filePathScss);
