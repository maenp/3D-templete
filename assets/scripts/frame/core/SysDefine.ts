/**窗体类型 */
export enum FormType {
    /** 屏幕 */
    Screen,
    /** 固定窗口 */
    Fixed,
    /** 弹出窗口 */
    Window,
    /** 独立窗口 */
    Tips,
}
/** UI的状态 */
export enum UIState {
    None = 0,
    Loading = 1,
    Showing = 2,
    Hiding = 3
}
/** 常量 */
export class SysDefine {
    public static SeparatorMap: {[key: string]: string} = {
        "_Node"        : "cc.Node",
        "_Label"       : "cc.Label",
        "_Button"      : "cc.Button",
        "_Sprite"      : "cc.Sprite",
        "_RichText"    : "cc.RichText",
        "_Mask"        : "cc.Mask",
        "_MotionStreak": "cc.MotionStreak",
        "_TiledMap"    : "cc.TiledMap",
        "_TiledTile"   : "cc.TiledTile",
        "_Spine"       : "sp.Skeleton",
        "_Graphics"    : "cc.Graphics",
        "_Animation"   : "cc.Animation",
        "_WebView"     : "cc.WebView",
        "_EditBox"     : "cc.EditBox",
        "_ScrollView"  : "cc.ScrollView",
        "_VideoPlayer" : "cc.VideoPlayer",
        "_ProgressBar" : "cc.ProgressBar",
        "_PageView"    : "cc.PageView",
        "_Slider"      : "cc.Slider",
        "_Toggle"      : "cc.Toggle",
        "_ButtonPlus"  : "ButtonPlus",
    };

}