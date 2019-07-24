const path = require("path");
const extractZh = require('./../dist');

//
const filePathHtml = path.normalize(__dirname + './../zh/');

const extract = new extractZh();
extract.exportZh(filePathHtml, 'csv', true);




