path = require("path");
const extractZh = require('./../dist');

const filePathHtml = path.normalize(__dirname + './../zh/xxx');
const filePathJs = path.normalize(__dirname + './../zh/js.js');
const filePathScss = path.normalize(__dirname + './../zh/scss.scss');
const extract = new extractZh();

extract.exportZh(filePathHtml);

