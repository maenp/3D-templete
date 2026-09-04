import * as cc from 'cc';
import { BaseLoader } from "./BaseLoader";
const { ccclass, property } = cc._decorator;

@ccclass('Lauch')
export class Lauch extends cc.Component {
    @property(cc.ProgressBar)
    private m_loadingBar : cc.ProgressBar = null!;

    @property(cc.Label)
    private m_lblProcess : cc.Label = null!;

    updateProcess(percent : number){
        this.m_lblProcess.string = `游戏加载中:${percent}%`
        this.m_loadingBar.progress = percent/100;
    }

    start () {
        this.initResourceSize();
        this.launchGame();
    }
    launchGame() {
        this.m_loadingBar.progress = 0;
        this.m_lblProcess.string = `加载bundle资源中 0%`
        BaseLoader.loadBundleArray(
            ["common", "app", "scripts"],
            (err, bundles) => {
                if (err || !bundles) {
                    cc.error("启动资源加载失败", err);

                    this.m_loadingBar.progress = 0;
                    this.m_lblProcess.string = "资源加载失败，请重试";
                    return;
                }

                bundles.forEach((bundle) => {
                    bundle.setGlobalBundle();
                });

                this.loadMainScene();
            },
            (percent) => {
                this.m_loadingBar.progress = percent;
                this.m_lblProcess.string =
                    `加载bundle资源中 ${Math.floor(percent * 100)}%`;
            },
        );
    }

    private loadMainScene() {
        this.m_loadingBar.progress = 0;
        this.m_lblProcess.string = "加载场景中 0%";

        const sceneLoader = new BaseLoader();
        sceneLoader.loadScene(
            "app#scene",
            (err: Error | null, sceneAsset: cc.SceneAsset | null) => {
                if (err || !sceneAsset?.scene) {
                    cc.error("主场景加载失败", err);
                    this.m_loadingBar.progress = 0;
                    this.m_lblProcess.string = "场景加载失败，请重试";
                    return;
                }

                cc.director.runSceneImmediate(
                    sceneAsset.scene,
                    () => {},
                    () => {
                        // 当前运行场景需要继续持有对应资源，不能在这里 releaseAll。
                    },
                );
            },
            (percent: number) => {
                const progress = Math.max(0, Math.min(1, percent));
                this.m_loadingBar.progress = progress;
                this.m_lblProcess.string =
                    `加载场景中 ${Math.floor(progress * 1000) / 10}%`;
            },
        );
    }
    initResourceSize() {
        let framesize = cc.screen.windowSize;
        let mysize = cc.size(750, 1624);

        let ftmp = framesize.width / framesize.height;
        let rtmp = mysize.width / mysize.height;

        let resolutionSize = mysize.clone();
        if (ftmp > rtmp) {
            resolutionSize.height = mysize.height;
            resolutionSize.width = resolutionSize.height * framesize.width / framesize.height;

        } else {
            resolutionSize.width = mysize.width;
            resolutionSize.height = resolutionSize.width * framesize.height / framesize.width;
        }
        cc.view.setDesignResolutionSize(resolutionSize.width, resolutionSize.height, cc.ResolutionPolicy.SHOW_ALL);
    }
}
