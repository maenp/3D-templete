import * as cc from 'cc';
import { BaseLoader, BundleAsset } from "./BaseLoader";
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

        BaseLoader.loadBundleArray(["common","app","scripts"], (err: Error | null, bundles: Map<string, BundleAsset> | null) => {
            if (bundles) {
                bundles.forEach((bundle) => {
                    bundle.setGlobalBundle();
                })
            }
            
            this.m_loadingBar.progress = 0;
            this.m_lblProcess.string = `加载场景中 0%`;

            const _resload: BaseLoader = new BaseLoader();
            _resload.loadScene(
                "app#scene",
                (err: Error, asset: cc.Scene) => {
                    if (!err && asset.scene) {
                        cc.director.runSceneImmediate(
                            asset.scene, 
                            () => {}, 
                            () => {
                                //这里加载的是主场景资源，不用销毁，也不能销毁
                                // _resload.releaseAll(); 
                            }
                        );
                    }
                },
                (percent: number) => {
                    this.m_loadingBar.progress = percent;
                    this.m_lblProcess.string = `加载场景中 ${Math.floor(percent * 1000) / 10}%`
                }
            )
        })
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
