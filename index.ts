const path = require("path");
const fs = require("fs-extra");
const readline = require('readline');

interface IFilesZh {
    zhStr:string
    lineNum:number
    filepath:string
}

class extractZh {

    private allFilesZhArr:any[] = [];
    private fileZhArr:IFilesZh[] = [];
    private lineNum:number = 1;
    private zhExp:RegExp = /[^\x00-\xff]+/g;
    private annotationExp:RegExp = /^[/|*]/;
    private annotationExp2:RegExp = /^<!|^<#/;

    constructor(){

    }


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
        zh && this.fileZhArr.push({
            lineNum,
            zhStr,
            filepath
        });
    }

    private readFileByLine = (filepath:any) =>{
        this.lineNum = 1;
        const fRead = fs.createReadStream(filepath);
        const objReadline = readline.createInterface({
            input:fRead
        });

        objReadline.on('line',(lineStr:string) => {
            this.extractZH(filepath, lineStr, this.lineNum, true);
            this.lineNum ++;
        });

        objReadline.on('close',() => {
            console.log('read file finish: ' + filepath);
            console.log(this.fileZhArr)
            this.allFilesZhArr.push(this.fileZhArr);
            console.log(this.allFilesZhArr)
        });
    };

    private recursionDirectory = (folderPath:string) =>{
        const readDirArr = fs.readdirSync(folderPath);
        console.log(readDirArr)
        readDirArr.map((fileName:string) => {
            const fileDir = path.join(folderPath, fileName);
            this.judgeFileByPath(fileDir);
        })
    };

    private judgeFileByPath = (path:any) => {
        const state = fs.statSync(path);
        if(state.isFile()){
            // 文件
            const fileZhArr = this.readFileByLine(path);
        }else if(state.isDirectory()){
            // 文件夹
            this.recursionDirectory(path)
        }
    };

    exportZh = (path:any) => {
        this.judgeFileByPath(path);
    }




}

module.exports = extractZh;
