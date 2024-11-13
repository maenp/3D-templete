

const buildConfig = {
	bid: "1003222",
	actions: [
		{
			type: "project-build",
			param: ""
		},
		//压缩入口html
		{
			type: "html-min",
			param: ""
		},
		{
			type: "remove",
			param: [
				"build/web-mobile/style*.css",
			]
		},
		//替换bid，代码常量
		{
			type: "replace-file",
			param: {
				file: "build/web-mobile/index.html",
				content: [
					["_bid_", "$bid"],
				]
			}
		},

		//拷贝资源到fep发布目录
		{
			type: "remove",
			param: [
				"documents/package/prod",
				"documents/package/test"
			]
		},

		{
			type: "copy",
			param: [
				["build/web-mobile", "documents/package/prod/static"]
			]
		},
		{
			type: "move",
			param: [
				["documents/package/prod/static/index.html", "documents/package/prod/index.html"]
			]
		},
		{
			type: "replace-file",
			param: {
				file: "documents/package/prod/index.html",
				content: [
					["_base_herf_", "https://g.momocdn.com/fep/momo/business-fe/cocos-frame/static/"]
				]
			}
		},
		{
			type: "copy",
			param: [
				["build/web-mobile", "documents/package/test/static"]
			]
		},
		{
			type: "move",
			param: [
				["documents/package/test/static/index.html", "documents/package/test/index.html"]
			]
		},
		{
			type: "replace-file",
			param: {
				file: "documents/package/test/index.html",
				content: [
					["_base_herf_", "https://test-g.momocdn.com/fep/momo/business-fe/cocos-frame/static/"]
				]
			}
		},
	]
}

module.exports = buildConfig;