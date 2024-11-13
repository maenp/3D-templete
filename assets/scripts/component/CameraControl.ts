
import { _decorator, Component, Node, Camera, Canvas, input, Input, EventTouch, Vec3, v3, Quat, math, quat } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('CameraControl')
export class CameraControl extends Component {

    @property(Node)
    target: Node = null;
    public yMinLimit = -90;//摄像机Y轴最小角度
    public yMaxLimit = 90;//摄像机Y轴最大角度

    private targetX = 0;//摄像机X轴 旋转角度
    private targetY = 0;//摄像机Y轴 旋转角度

    private xSpeed = 25;
    private ySpeed = 12;

    private disance: Vec3 = v3();
    start() {
        let angles = this.node.eulerAngles;//相机的旋转角度
        this.targetX = angles.y;
        this.targetY = angles.x;
       
        
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        Vec3.subtract(this.disance, this.node.worldPosition, this.target.worldPosition);
        this.disance = v3(0,0,this.disance.length());
        
    }
    private onTouchMove(touch: EventTouch) {
        this.targetX -= touch.getDeltaX() * this.xSpeed * 0.02;
        this.targetY += touch.getDeltaY() * this.ySpeed * 0.02; 
        this.targetY = this.ClampAngle(this.targetY, this.yMinLimit, this.yMaxLimit); 
    }
    private _quat = quat();// 四元数
    private _vec3 = v3();
    update (deltaTime: number) {
        Quat.fromEuler(this._quat, this.targetY, this.targetX, 0);//通过欧拉角计算四元数
        Vec3.transformQuat(this._vec3, this.disance, this._quat);//通过四元数和距离计算 相机坐标
        Vec3.add(this._vec3, this.target.worldPosition, this._vec3);//相机坐标加上目标坐标
        this.node.worldPosition = this._vec3;
        this.node.worldRotation = this._quat;
    }

    ClampAngle(angle, min, max) {
        if (angle < -360) angle += 360;
        if (angle > 360) angle -= 360;

        return math.clamp(angle, min, max);
    }
}


