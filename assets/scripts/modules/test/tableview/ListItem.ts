/*
 * @Author: xzben
 * @Date: 2022-06-06 18:23:55
 * @LastEditors: xzben
 * @LastEditTime: 2022-06-06 18:25:24
 * @Description: file content
 */
import * as cc from 'cc';
import { TableViewCell } from "../../../component";
import resload from "../../../frame/core/ResLoader";
const { ccclass, property } = cc._decorator;

@ccclass('ListItem')
export class ListItem extends TableViewCell {

    @property(cc.Sprite)
    private m_icon : cc.Sprite = null!;
    
    @property(cc.Label)
    private m_lblIndex : cc.Label = null!;

    @property(cc.Label)
    private m_name : cc.Label = null!;
    
    @property(cc.Label)
    private m_num : cc.Label = null!;

    public updateData( idx : number, cellData : { name : string, icon : string, num : number, total : number}, extendData : any){
        this.m_lblIndex.string = idx.toString();
        this.m_name.string = cellData.name;
        // this.updateSprite(this.m_icon, cellData.icon);
        this.m_num.string = `${cellData.num}/${cellData.total}`;
    }
    public updateSprite(sp: cc.Sprite | cc.Mask, path: string) {
        resload.loadSpriteFrame(path, (err, frame: cc.SpriteFrame) => {
            if (sp && cc.isValid(sp) && cc.isValid(sp.node)) {
                sp.spriteFrame = frame;
            }
        })
    }
}