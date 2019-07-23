const fs = require('fs');
const readline = require('readline');

class Utils {

    private lineNum:number = 1;
    private zhExp:RegExp = /[^\x00-\xff]+/g;
    private zhArr:any[] = [];
    private annotationExp:RegExp = /^[/|*]/;
    private annotationExp2:RegExp = /^<!|^<#/;

    private extractZH(filepath:string, lineStr:string, lineNum:number, filterAnnotation:boolean){
        lineStr = lineStr.trim();
        const { zhExp, annotationExp, annotationExp2 } = this;
        let zh:RegExpMatchArray | null = null;
        let zhStr:string;
        if(filterAnnotation){
            const res = lineStr.match(annotationExp);
            const res2 = lineStr.match(annotationExp2);
            // 该行是注释
            if(res || res2) return
        }
        zh = lineStr.match(zhExp);
        zhStr = (zh && zh[0]) as string;
        zh && this.zhArr.push({
            lineNum,
            zhStr,
            filepath
        });
    }

    readFileByLine = (filepath:any) =>{
        const fRead = fs.createReadStream(filepath);

        const objReadline = readline.createInterface({
            input:fRead
        });

        objReadline.on('line',(lineStr:string) => {
            this.extractZH(filepath, lineStr, this.lineNum, true);
            this.lineNum ++;
        });

        objReadline.on('close',() => {
            console.log('read file finish')
            console.log(this.zhArr)
        });

    }
}

module.exports = Utils

