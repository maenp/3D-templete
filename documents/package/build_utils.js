


const fs = require('fs');
const path = require('path');
var glob = require("glob")

const buildConfig = require('./build_config')

class BuildUtils {
    constructor() {
        this.projectPath = path.join(__dirname, "../../");
    }

    copy(src, dst) {
        if (fs.existsSync(src)) {
            this.mkdirsSync(dst)
            if (fs.statSync(src).isDirectory()) {
                this.copyDir(src, dst)
            } else {
                this.copyFile(src, dst)
            }
        } else {
            console.log('Warning: Try to copy a non-existent file: ' + src)
        }
    }

    mkdirsSync(dirname) {
        if (fs.existsSync(dirname)) {
            return true;
        } else {
            if (this.mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname);
                return true;
            }
        }
    }

    copyFile(src, dst) {
        //目标是目录
        if (path.extname(dst) == "") {
            //创建文件夹
            if (!fs.existsSync(dst)) {
                fs.mkdirSync(dst);
            }

            dst = path.join(dst, path.basename(src))
        } else {
            //创建文件夹
            let dstPath = path.dirname(dst);
            if (!fs.existsSync(dstPath)) {
                fs.mkdirSync(dstPath);
            }
        }

        fs.copyFileSync(src, dst);
    }

    copyDir(src, dst) {
        //创建文件夹
        if (!fs.existsSync(dst)) {
            fs.mkdirSync(dst);
        }

        for (let file of fs.readdirSync(src)) {
            //忽略文件
            let baseName = path.basename(file);
            if (baseName.startsWith('.')) {
                continue;
            }

            let curSrc = path.join(src, file);
            let curDst = path.join(dst, file);
            if (fs.statSync(curSrc).isDirectory()) {
                //创建文件夹
                if (!fs.existsSync(curDst)) {
                    fs.mkdirSync(curDst);
                }

                this.copyDir(curSrc, curDst);
            } else {
                fs.copyFileSync(curSrc, curDst);
            }
        }
    }

    realPath(filePath) {
        filePath = filePath.replace('$currentTime', Date.now())
        let fullPath = path.join(this.projectPath, filePath);
        return fullPath;
    }

    matchPath(filePath) {
        return glob.sync(filePath)
    }

    //Remove a file or a whole directory
    remove(filePath) {
        if (!fs.existsSync(filePath)) {
            console.log('Warning: Try to remove a non-existent file: ' + filePath);
            return;
        }

        if (fs.statSync(filePath).isDirectory()) {
            for (let file of fs.readdirSync(filePath)) {
                let curPath = path.join(filePath, file);
                this.remove(curPath);
            }

            fs.rmdirSync(filePath);
        } else {
            fs.unlinkSync(filePath);
        }
    }

    //Rename a file to a new name
    rename(src, dst) {
        if (fs.existsSync(dst)) {
            this.remove(dst)
        }

        fs.renameSync(src, dst)
    }

    realContent(str) {
        str = str.replace('$bid', buildConfig.bid)
        return str;
    }

    replaceFile(param) {
        let filePath = this.matchPath(this.realPath(param.file))[0];
        let fileContent = fs.readFileSync(filePath, {encoding: "utf-8"});

        for (let content of param.content) {
            let origin = this.realContent(content[0])
            let dest = this.realContent(content[1])
            let reg = new RegExp(origin, 'g')
            fileContent = fileContent.replace(reg, dest)
        }

        fs.writeFileSync(filePath, fileContent);
    }
}

const buildUtils = new BuildUtils();
module.exports = buildUtils;