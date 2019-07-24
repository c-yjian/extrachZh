import {ReadStream} from "fs";
import {Interface} from "readline";

const path = require("path");
const fs = require("fs-extra");
const readline = require('readline');

interface IFilesZh {
    zhStr:string
    lineNum:number
    filepath:string
}

class extractZh {

    //存放传入路径下的所有文件
    private allFilesPathArr:string[] = [];
    //记录需要读取的文件数量
    private allFilesNum:number = 0;
    //是否需要过滤注释中的中文
    private filterAnnotation:boolean = false;
    //存放所有文件中提取出的中文
    private allFilesZhArr:IFilesZh[] = [];
    //匹配中文的正则
    private zhExp:RegExp = /[^\x00-\xff]+/g;
    //注释正则
    private annotationExp:RegExp = /^[/|*]/;
    private annotationExp2:RegExp = /^<!|^<#/;

    private extractZH(filepath:string, lineStr:string, lineNum:number):void{
        lineStr = lineStr.trim();
        const { zhExp, annotationExp, annotationExp2, filterAnnotation } = this;
        let zh:RegExpMatchArray | null = null;
        let zhStr:string;
        if(filterAnnotation){
            const res:RegExpMatchArray | null = lineStr.match(annotationExp);
            const res2:RegExpMatchArray | null = lineStr.match(annotationExp2);
            // 该行是注释
            if(res || res2) return
        }
        zh = lineStr.match(zhExp);
        zhStr = (zh && zh[0]) as string;
        zh && this.allFilesZhArr.push({
            lineNum,
            zhStr,
            filepath
        });
    }

    private readFilesInline = (filePath:string):void =>{
        let lineNum:number = 1;
        const fRead:ReadStream = fs.createReadStream(filePath);
        const objReadline:Interface = readline.createInterface({
            input:fRead
        });

        objReadline.on('line',(lineStr:string) => {
            this.extractZH(filePath, lineStr, lineNum);
            lineNum ++;
        });

        objReadline.on('close',() => {
            this.allFilesNum --;
            if(this.allFilesNum == 0){
                console.log(this.allFilesZhArr)
            }
        });
    };

    private recursionDirectory = (folderPath:string):void =>{
        const readDirArr = fs.readdirSync(folderPath);
        readDirArr.map((fileName:string) => {
            const fileDir = path.join(folderPath, fileName);
            const state = fs.statSync(fileDir);
            if(state.isFile()){
                // 文件
                this.allFilesPathArr.push(fileDir);
            }else if(state.isDirectory()){
                // 文件夹
                this.recursionDirectory(fileDir)
            }
        })
    };

    private judgePath = (path:any):void => {
        const { readFilesInline } = this;
        const state = fs.statSync(path);
        if(state.isFile()){
            // 文件
           this.allFilesPathArr.push(path);
        }else if(state.isDirectory()){
            // 文件夹
            this.recursionDirectory(path)
        }
        this.allFilesNum = this.allFilesPathArr.length;
        this.allFilesPathArr.map((filePath:string, index:number) =>{
            readFilesInline(filePath);
        })
    };

    /**
     *
     * path: 用户输入的路劲，即需要将该路径下的所有文件的中文字符串导出
     * filterAnnotation: 导出字符串的过程中是否需要忽略注释，默认不过滤
     *
     * */
    public exportZh = (path:string, filterAnnotation:boolean):void => {
        this.judgePath(path);
        filterAnnotation && (this.filterAnnotation = filterAnnotation);
    }

}

module.exports = extractZh;
