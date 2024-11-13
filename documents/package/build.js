
//支持功能列表：
//备份
//     type: "backup",
//     param: [
//         "assets"
//     ]
//cocos编译
//     type: "project-build", 
//     param: ""
//命令行调用
//     type: "command", 
//     param: "ls -a"
//拷贝
//     type: "copy",
//     param: [
//         ["../config/beta/", "../config/beta2/"]
//     ]
//重命名
//     type: "rename",
//     param: [
//         ["../../build/web-mobile", "../../build/$name"]
//     ]
//删除
//     type: "remove", 
//     param: [
//         ["../config/beta2/"]
//     ]

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const buildUtils = require('./build_utils');
const localSettings = require('./local_settings');
const buildConfig = require('./build_config');

class Builder {
	constructor() {
		this.curPath = __dirname;
		this.projectPath = path.join(__dirname, "../../");
		this.actionList = [];
		this.changes = [];
	}

	backup(originPath, backPath) {
		if (this.changes.indexOf(originPath) < 0) {
			this.changes.push([originPath, backPath]);
			backPath = path.join('_backup', backPath);
			buildUtils.copy(originPath, backPath);
		}
	}

	//Copy a file or a whole directory to destination folder
	doCopy(param) {
		for (let copy of param) {
			let src = copy[0];
			let dst = copy[1];
			console.log(`Copying files from "${src}" to "${dst}"...`);

			buildUtils.copy(buildUtils.realPath(src), buildUtils.realPath(dst));
		}

		this.doNextAction();
	}

	//
	doMove(param) {
		for (let move of param) {
			let src = move[0];
			let dst = move[1];
			console.log(`Moving files from "${src}" to "${dst}"...`);

			fs.renameSync(buildUtils.realPath(src), buildUtils.realPath(dst));
		}

		this.doNextAction();
	}

	projectBuild(param) {
		let creatorPath = localSettings.creatorPath;
		let configPath = path.join(__dirname, "./buildConfig_web-mobile.json")


		let command = `${creatorPath} --project ${this.projectPath} --build "configPath=${configPath}"`;
		console.log("project build cmd = " + command);

		let child = exec(command, (err, stdout, stderr) => {
			// if (err) {
			// 	console.log(err);
			// 	this.buildFailed();
			// 	return;
			// }
			console.log('构建完成');
			this.doNextAction();
		});

		child.stdout.on('data', (data) => {
			console.log(data);
		});
		child.stderr.on('data', (data) => {
			console.error(data);
		});
	}

	doRemove(param) {
		for (let filePath of param) {
			console.log(`Removing "${filePath}"...`);

			let matchPathArr = buildUtils.matchPath(buildUtils.realPath(filePath));
			for (let matchPath of matchPathArr) {
				buildUtils.remove(matchPath);
			}
		}

		this.doNextAction();
	}

	doRename(param) {
		for (let rename of param) {
			let src = rename[0];
			let dst = rename[1];
			console.log(`Rename "${src}" to "${dst}"`);

			buildUtils.rename(buildUtils.realPath(src), buildUtils.realPath(dst));
		}

		this.doNextAction();
	}

	doCommand(param) {
		let child = exec(param, (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				this.buildFailed();
				return;
			}

			this.doNextAction();
		});

		child.stdout.on('data', (data) => {
			console.log(data);
		});
		child.stderr.on('data', (data) => {
			console.error(data);
		});
	}

	doReplaceFile(param) {
		buildUtils.replaceFile(param);

		this.doNextAction();
	}

	htmlMin() {
		let child = exec(`gulp -f ${this.curPath}/gulp/gulpfile.js`, (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				this.buildFailed();
				return;
			}

			this.doNextAction();
		});

		child.stdout.on('data', (data) => {
			console.log(data);
		});
		child.stderr.on('data', (data) => {
			console.error(data);
		});
	}

	packJson() {
		let child = exec(`gulp -f ${this.curPath}/gulp/gulp_pack_json.js`, (err, stdout, stderr) => {
			if (err) {
				console.log(err);
				this.buildFailed();
				return;
			}

			this.doNextAction();
		});

		child.stdout.on('data', (data) => {
			console.log(data);
		});
		child.stderr.on('data', (data) => {
			console.error(data);
		});
	}


	buildSuccess() {
		console.log("build finish");
		process.exit(0);
	}

	buildFailed() {
		console.error('\x1B[31m%s\x1B[0m', 'build failded');
		process.exit(0);
	}

	doNextAction() {
		if (this.actionList.length <= 0) {
			this.buildSuccess();
			return;
		}

		let action = this.actionList.shift();

		console.log("action type " + action.type);
		if (action.type == 'copy') {
			this.doCopy(action.param);
		} else if (action.type == 'remove') {
			this.doRemove(action.param);
		} else if (action.type == 'move') {
			this.doMove(action.param);
		} else if (action.type == 'rename') {
			this.doRename(action.param);
		} else if (action.type == 'command') {
			this.doCommand(action.param);
		} else if (action.type == 'project-build') {
			this.projectBuild(action.param);
		} else if (action.type == 'replace-file') {
			this.doReplaceFile(action.param);
		} else if (action.type == 'html-min') {
			this.htmlMin(action.param);
		} else if (action.type == 'pack-json') {
			this.packJson(action.param);
		} else {
			console.error('\x1B[31m%s\x1B[0m', 'action not find ' + action.type);
			this.buildFailed();
		}
	}

	build() {
		console.log("start build...");
		this.buildConfig = buildConfig;
		this.actionList = buildConfig.actions.slice();
		this.doNextAction();
	}
}

function main() {
	let builder = new Builder();
	builder.build();
}

main();