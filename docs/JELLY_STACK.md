# 果冻叠叠乐

Cocos Creator 3.8.8。保留 launch → bundle 加载 → app/scene 的启动流程。

## 编辑 UI

打开 `assets/modules/app/screen/jelly.prefab`：

- 根节点绑定 `assets/scripts/modules/app/UIJelly.ts`，继承 `UIScreen`。
- `UIJelly.prefabPath = 'app#screen/jelly'`，由 app 场景调用 `UIJelly.openView()`。
- `JellyHUD`：原生 Label、Button、Sprite；通过 `@property` 绑定。
- `JellyWorld`、`Camera3D`、`Main Light`：页面内的 3D 游戏节点，不挂在 app 场景上。
- 游戏使用独立渲染层，避免 app 场景通用相机重复绘制。
- 页面不修改 launch 设置的全局分辨率；全屏适配由框架 `AdapterMgr` 处理。
- `onShow` 初始化，`onHide` 停止待执行逻辑，销毁时解绑输入并释放程序生成资源。

启动流程：`launch` 加载 bundles → `app/scene` → `UIJelly.openView()` → `app#screen/jelly`。
新增其他全屏页面同样遵循 `screen/xxx.prefab` + `UIXxx.ts extends UIScreen`。

## 游戏与素材

- 点击开始，之后点击屏幕、落下按钮或空格叠放。
- 果冻在 X、Z 两个方向交替移动。错开的部分切掉；完全错开结束。
- 普通落下 +1，精准落下 +2，连续三次及以上精准落下 +3。
- P / Esc 或暂停按钮暂停，再点继续；切走应用时暂停移动阶段。
- 最高分保存在本地 `jelly-stack-best`。
- 圆角果冻网格、糖粒和配色由游戏代码生成，共用网格及材质。
- `assets/modules/app/imgs/jelly-button.png` 为程序生成的按钮九宫格图片。
- `assets/resources/JellySurface.effect` 为 Cocos 自带标准着色器的本地副本，保留原版权声明；由场景直接引用，确保旧版渲染管线加载依赖。

## 验证流程

修改文件 → 切离并切回 Cocos Creator → 等待导入与脚本编译 → 浏览器刷新预览。
浏览器键盘操作前需点击游戏画布以获得焦点。

类型检查：

```sh
node /Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents/Resources/app.asar.unpacked/node_modules/typescript/bin/tsc --noEmit --skipLibCheck --pretty false
```

`skipLibCheck` 跳过引擎声明文件自身的环境类型问题，仍检查项目脚本。
