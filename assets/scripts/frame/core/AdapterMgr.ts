import { _decorator, view, Node, Size, Widget, find, UITransform } from 'cc';

let flagOffset = 0;
const _None = 1 << flagOffset ++;
const _Left = 1 << flagOffset ++;            // 左对齐
const _Right = 1 << flagOffset ++;           // 右对齐
const _Top = 1 << flagOffset ++;             // 上对齐
const _Bottom = 1 << flagOffset ++;          // 下对齐
const _StretchWidth = _Left | _Right;          // 拉伸宽
const _StretchHeight = _Top | _Bottom;         // 拉伸高

const _FullWidth = 1 << flagOffset ++;       // 等比充满宽
const _FullHeight = 1 << flagOffset ++;      // 等比充满高
const _Final = 1 << flagOffset++;

/**  */
export enum AdapterType {
    Top = _Top,
    Bottom = _Bottom,
    Left = _Left,
    Right = _Right,

    StretchWidth = _StretchWidth,
    StretchHeight = _StretchHeight,

    FullWidth = _FullWidth,
    FullHeight = _FullHeight,
}

export default class AdapterMgr {

    private static _instance: AdapterMgr = null;                     // 单例
    public static get inst() {
        if(this._instance == null) {
            this._instance = new AdapterMgr();       
            this._instance.visibleSize = view.getVisibleSize();
            console.log(`visiable size: ${this._instance.visibleSize}`);
        }
        return this._instance;
    }
    
    /** 屏幕尺寸 */
    public visibleSize: Size;

    public adapteByType(flag: number, node: Node, distance = 0) {
        let tFlag = _Final;
        while (tFlag > 0) {
            if (tFlag & flag)
                this._doAdapte(tFlag, node, distance);
            tFlag = tFlag >> 1;
        }
        let widget = node.getComponent(Widget);
        widget.target = find("Canvas");
        widget.updateAlignment();
    }

    private _doAdapte(flag: number, node: Node, distance: number = 0) {
        let uiSize = node.getComponent(UITransform);
        let widget = node.getComponent(Widget);
        if(!widget) {
            widget = node.addComponent(Widget);
        }
        switch(flag) {
            case _None:
                break;
            case _Left:
                widget.isAlignLeft = true;
                widget.isAbsoluteLeft = true;
                widget.left = distance ? distance : 0;
                break;
            case _Right:
                widget.isAlignRight = true;
                widget.isAbsoluteRight = true;
                widget.right = distance ? distance : 0;
                break;
            case _Top:
                widget.isAlignTop = true;
                widget.isAbsoluteTop = true;
                widget.top = distance ? distance : 0;
                break;
            case _Bottom:
                widget.isAlignBottom = true;
                widget.isAbsoluteBottom = true;
                widget.bottom = distance ? distance : 0;
                break;
            case _FullWidth:
                uiSize.height /= uiSize.width / this.visibleSize.width;
                uiSize.width = this.visibleSize.width;
                break;
            case _FullHeight:
                uiSize.width /= uiSize.height / this.visibleSize.height;
                uiSize.height = this.visibleSize.height;
                break;
        }
    }
}
