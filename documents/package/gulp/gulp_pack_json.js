/**
 * 合并json为一个js文件
 * 然后保存到build/web-mobile文件
 */
const path = require('path');
const gulp = require('gulp');
const through = require('through2');
const File = require('vinyl');
const crypto = require('crypto');
const fs = require('fs');

const buildConfig = require('../build_config');

const projectPath = path.join(__dirname, "../../../");

let doPack = function (cb) {
    let src = [];//要合并的json路径
    for (let action of buildConfig.actions) {
        if (action.type == "pack-json") {
            for (let filePath of action.param) {
                src.push(projectPath + filePath);
            }
            
            break;
        }
    }


    let finalObj = [];
    //修改index.html文件对应__Pack_Json_Url__
    function replaceFileName(fileName) {
        let replaceFilePath = `${projectPath}build/web-mobile/index.html`;
        let fileContent = fs.readFileSync(replaceFilePath, {encoding: "utf-8"});

        let origin = '__Pack_Json_Url__';
        let dest = fileName;
        let reg = new RegExp(origin, 'g')
        fileContent = fileContent.replace(reg, dest)

        fs.writeFileSync(replaceFilePath, fileContent);
    }

    function bufferContents(chunk, enc, callback) {
        let fileName = chunk.path;
        let idx = fileName.indexOf('assets/');
        fileName = fileName.slice(idx);
        let fileContent = chunk.contents.toString();//获取文件内容
        let fileObj = JSON.parse(fileContent);//json转obj
        finalObj.push({
            key: fileName,//key:"assets/internal/config.803f8.json"
            content: fileObj//content:{a:1}
        });

        callback();
    }

    function endStream(callback) {
        let fileJson = JSON.stringify(finalObj);//obj转json
        let fileContent = Buffer.from(fileJson);
        let md5 = crypto.createHash('md5').update(fileJson).digest('hex').slice(0, 10);
        let fileName = "pack_json_" + md5 + ".js";
        replaceFileName(fileName);
        let joinedFile = new File();
        joinedFile.path = path.join(__dirname, fileName);//这个路径不写报错，可以随便写，写了又不知道有什么用

        joinedFile.contents = fileContent;
        this.push(joinedFile);//文件传递保存

        callback();
    }

    gulp.src(src)
        .pipe(through.obj(bufferContents, endStream))
        .pipe(
            // 合并所有json文件后 保留到下面目录
            gulp.dest(`${projectPath}/build/web-mobile`
        ).on('end', cb));
}

exports.default = doPack;