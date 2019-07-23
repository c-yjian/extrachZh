const path = require("path");
const Util = require("./util");

class extractZh {

    private Utils:any

    constructor(){
        this.Utils = new Util();
    }

    readFileByLine = (filepath:any) => {

        this.Utils.readFileByLine(filepath)

    }

}

module.exports = extractZh
