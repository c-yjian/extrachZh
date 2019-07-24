import {ReadStream, Stats} from "fs";
import {Interface} from "readline";

const path = require("path");
const fs = require("fs-extra");
const readline = require('readline');
const converter = require('json-2-csv');
const xlsx = require('node-xlsx').default;

interface IStrInfo {
    zhStr:string
    lineNum:number
    filepath:string
}

enum ExportType{
    excel='excel',
    json = 'json',
    csv = 'csv'
}

type RegRes = RegExpMatchArray | null;

class extractZh {

    // 当前项目的根路径
    private rootDir:string = path.join(__dirname,'../');
    //用户传入提取文件（夹）名
    private extractFolder:string = path.basename(this.rootDir);
    //导出文件类型，默认是excel
    private exportType:ExportType = ExportType.excel;
    // 存放传入路径下的所有文件
    private allFilesPathArr:string[] = [];
    // 记录需要读取的文件数量
    private allFilesNum:number = 0;
    // 是否需要过滤注释中的中文
    private filterAnnotation:boolean = false;
    // 存放所有文件中提取出的中文
    private allFilesZhArr:IStrInfo[] = [];
    //匹配中文的正则
    private zhExp:RegExp = /[^\x00-\xff]+/g;
    //注释正则
    private annotationReg:RegExp = /^[/|*]/;
    private annotationReg2:RegExp = /^<!|^<#/;
    //隐藏文件正则
    private hideFileReg:RegExp = /^\./;
    //不遍历文件夹黑名单
    private blackFolderList:string[] = ['node_modules'];
    private excelTitle:string[] = ['中文字符串', '所在行数', '文件所在路径'];

    private exportFile = () =>{
        const { allFilesZhArr, excelTitle, extractFolder, exportType } = this;
        const fileName:string = `${extractFolder}-extract-zh`;
        const excelDataArr:any = [excelTitle];
        const JsonStr = JSON.stringify({
            extractZh:allFilesZhArr
        });
        console.log(JsonStr);
        if(exportType === ExportType.csv){
            converter.json2csv(allFilesZhArr, (err:Error,csvStr:string) =>{
                fs.writeFileSync(`${fileName}.csv`, csvStr);
            });
        }else if(exportType === ExportType.json){
            fs.writeFileSync(`${fileName}.json`, JsonStr);
        }else {
            allFilesZhArr.map((strInfo:IStrInfo) => {
                excelDataArr.push([
                    strInfo.zhStr,
                    strInfo.lineNum,
                    strInfo.filepath
                ])
            });
            const excelBuffer = xlsx.build([{name: "mySheetName", data: excelDataArr}]);
            fs.writeFileSync(`${fileName}.xlsx`, excelBuffer);
        }
    };

    private extractZH(filepath:string, lineStr:string, lineNum:number):void{
        lineStr = lineStr.trim();
        const { zhExp, annotationReg, annotationReg2, filterAnnotation } = this;
        let zh:RegRes = null;
        let zhStr:string;
        if(filterAnnotation){
            const res:RegRes = lineStr.match(annotationReg);
            const res2:RegRes = lineStr.match(annotationReg2);
            // 该行是注释
            if(res || res2) return
        }
        zh = lineStr.match(zhExp);
        zhStr = (zh && zh[0]) as string;
        zh && this.allFilesZhArr.push({
            zhStr,
            lineNum,
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
                this.exportFile();
            }
        });
    };

    private recursionDirectory = (folderPath:string):void =>{
        const { hideFileReg, blackFolderList } = this;
        const readDirArr = fs.readdirSync(folderPath);
        readDirArr.map((fileName:string) => {
            const res:RegRes = fileName.match(hideFileReg);
            // 隐藏文件
            if(res) return
            if( blackFolderList.indexOf(fileName) > -1 ) return;
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
        try{
            const state:Stats = fs.statSync(path);
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
        }catch (e) {
            console.log(e)
        }
    };

    /**
     *
     * path: 用户输入的路劲，即需要将该路径下的所有文件的中文字符串导出，默认是根目录
     * filterAnnotation: 导出字符串的过程中是否需要忽略注释，默认不过滤
     *
     * */
    public exportZh = (extractPath?:string, exportType?:ExportType, filterAnnotation?:boolean, ):void => {
        const { rootDir } = this;
        extractPath && (this.extractFolder = path.basename(extractPath));
        exportType && (this.exportType = exportType);
        filterAnnotation && (this.filterAnnotation = filterAnnotation);
        this.judgePath(extractPath || rootDir);
    }
}

module.exports = extractZh;
