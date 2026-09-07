import { _decorator, Node, Camera, Button, Color, Vec3, Mesh, MeshRenderer, Material, EffectAsset, isValid, profiler, utils, Label, input, Input, EventKeyboard, KeyCode, tween, Tween, sys, game, Game } from 'cc';
import { UIScreen } from '../../frame/core/UIForm';
const { ccclass, property } = _decorator;
type Block = { node: Node; x: number; z: number; w: number; d: number; y: number };
const MOVE_RANGE = 4.3;
const COLORS = ['#efa798', '#f3c16e', '#b7cba0', '#83bdb3', '#aaa7cd', '#dcabc3'];

/** Self-contained procedural assets; no external models, fonts or textures. */
@ccclass('UIJelly')
export default class UIJelly extends UIScreen {
    static prefabPath = 'app#screen/jelly';
    private initialized = false;
    @property(Node) private world: Node = null!;
    @property(Camera) private camera: Camera = null!;
    @property(EffectAsset) private surface: EffectAsset = null!;
    @property(Button) private actionButton: Button = null!;
    @property(Button) private pauseButton: Button = null!;
    @property(Node) private tapArea: Node = null!;
    private mesh!: Mesh;
    private materials: Material[] = [];
    private top!: Block;
    private active: Block | null = null;
    private phase: 'ready' | 'playing' | 'landing' | 'over' = 'ready';
    private axis: 'x' | 'z' = 'x';
    private elapsed = 0;
    private count = 0;
    private points = 0;
    private combo = 0;
    private best = 0;
    private targetY = 0;
    private cameraY = 0;
    @property(Label) private score: Label = null!;
    @property(Label) private record: Label = null!;
    @property(Label) private message: Label = null!;
    @property(Label) private hint: Label = null!;
    @property(Label) private action: Label = null!;
    @property(Label) private subtitle: Label = null!;
    private paused = false;
    @property(Label) private pauseLabel: Label = null!;
    private debris: { node: Node; vx: number; vz: number; vy: number; life: number }[] = [];

    public onShow() {
        if (!this.initialized) {
            this.initializeGame();
            this.initialized = true;
        }
    }

    public onHide() {
        this.unscheduleAllCallbacks();
        this.world.children.forEach(node => Tween.stopAllByTarget(node));
    }

    private initializeGame() {
        profiler.hideStats();
        this.mesh = this.makeSoftCube();
        [...COLORS, '#e1dfd0', '#fdfbf2', '#435d50'].forEach(hex => {
            const mat = new Material();
            mat.initialize({ effectAsset: this.surface });
            mat.setProperty('mainColor', new Color(hex));
            mat.setProperty('roughness', 0.32);
            mat.setProperty('metallic', 0);
            this.materials.push(mat);
        });
        this.actionButton.node.on(Button.EventType.CLICK, this.press, this);
        this.pauseButton.node.on(Button.EventType.CLICK, this.togglePause, this);
        this.tapArea.on(Node.EventType.TOUCH_END, this.press, this);
        try { this.best = Math.max(0, Number(sys.localStorage.getItem('jelly-stack-best')) || 0); } catch (_) {}
        input.on(Input.EventType.KEY_DOWN, this.onKey, this);
        game.on(Game.EVENT_HIDE, this.onAppHide, this);
        this.reset(false);
        console.log('[UIJelly] ready — app#screen/jelly opened');
    }

    // Rounded cuboid from six gridded faces. Shared mesh is reused for every block.
    private makeSoftCube(): Mesh {
        const positions: number[] = [], normals: number[] = [], indices: number[] = [];
        const steps = [-0.5, -0.47, -0.43, 0.43, 0.47, 0.5];
        for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
            const base = positions.length / 3;
            for (const u of steps) for (const v of steps) {
                const p = [0, 0, 0]; p[axis] = sign * 0.5; p[(axis + 1) % 3] = u; p[(axis + 2) % 3] = v;
                const q = p.map(n => Math.max(-0.43, Math.min(0.43, n)));
                const delta = p.map((n, i) => n - q[i]);
                const length = Math.hypot(...delta);
                positions.push(...q.map((n, i) => n + delta[i] / length * 0.07));
                normals.push(...delta.map(n => n / length));
            }
            for (let u = 0; u < 5; u++) for (let v = 0; v < 5; v++) {
                const a = base + u * 6 + v, b = a + 6, c = b + 1, d = a + 1;
                indices.push(...(sign > 0 ? [a,b,c,a,c,d] : [a,c,b,a,d,c]));
            }
        }
        return utils.createMesh({ positions, normals, indices });
    }
    private solid(name: string, x: number, y: number, z: number, w: number, h: number, d: number, color: number): Node {
        const node = new Node(name); node.layer = 2; this.world.addChild(node);
        node.setPosition(x,y,z); node.setScale(w,h,d);
        const renderer = node.addComponent(MeshRenderer); renderer.mesh = this.mesh; renderer.setMaterial(this.materials[color],0);
        return node;
    }
    private reset(play: boolean) {
        this.unscheduleAllCallbacks();
        this.world.children.slice().forEach(n => { Tween.stopAllByTarget(n); n.destroy(); });
        this.debris = []; this.count = 0; this.points = 0; this.combo = 0; this.targetY = 0; this.cameraY = 0; this.paused = false;
        this.pauseLabel.string = 'Ⅱ';
        this.solid('Plinth lower',0,-1.08,0,4.9,0.32,4.9,6);
        this.solid('Porcelain platform',0,-0.84,0,4.7,0.22,4.7,7);
        this.solid('Base trim',0,-0.67,0,4.05,0.16,4.05,8);
        this.top = {node:this.solid('Pistachio foundation',0,-0.34,0,3.5,0.5,3.5,2),x:0,z:0,w:3.5,d:3.5,y:-0.34};
        this.phase = play ? 'playing' : 'ready';
        this.message.string = ''; this.subtitle.string = '把一点点甜，叠成一座塔。';
        this.hint.string = '看准时机，让果冻落在正中间';
        this.action.string = play ? '落下  ↓' : '开始叠叠乐  →';
        this.updateScore(); this.spawn();
    }
    private spawn() {
        this.axis = this.count % 2 === 0 ? 'x' : 'z'; this.elapsed = -Math.PI / 2;
        const {x,z,w,d,y} = this.top;
        // Create at the motion's starting position, before the first rendered frame.
        const offset = Math.sin(this.elapsed) * MOVE_RANGE;
        const startX = x + (this.axis === 'x' ? offset : 0);
        const startZ = z + (this.axis === 'z' ? offset : 0);
        this.active = {node:this.solid('Moving jelly',startX,y+1.28,startZ,w,0.5,d,this.count%6),x:startX,z:startZ,w,d,y:y+1.28};
        this.targetY = Math.max(0,this.top.y - 0.4);
    }
    private updateScore() {
        this.score.string = (this.points < 10 ? '0' : '') + this.points;
        this.record.string = `已叠 ${this.count} 层     /     最佳 ${this.best} 分`;
    }
    private onKey(e: EventKeyboard) {
        if (e.keyCode === KeyCode.SPACE) this.press();
        if (e.keyCode === KeyCode.KEY_P || e.keyCode === KeyCode.ESCAPE) this.togglePause();
    }
    private onAppHide() { if (!this.paused && this.phase !== 'over' && this.phase !== 'ready') this.togglePause(); }
    private togglePause() {
        if (this.phase !== 'playing') return;
        this.paused = !this.paused; this.pauseLabel.string = this.paused ? '▶' : 'Ⅱ';
        this.message.string = this.paused ? '休息一下，甜蜜不会溜走' : '';
        this.action.string = this.paused ? '继续游戏  →' : '落下  ↓';
    }
    private press() {
        if (this.phase === 'ready' || this.phase === 'over') { this.reset(true); return; }
        if (this.paused) { this.togglePause(); return; }
        if (this.phase !== 'playing' || !this.active) return;
        this.phase = 'landing';
        const block = this.active;
        tween(block.node).to(0.15,{position: new Vec3(block.x,this.top.y+0.51,block.z)},{easing:'quadIn'})
            .call(() => this.land(block)).start();
    }
    private land(block: Block) {
        block.y = this.top.y + 0.51;
        const axis = this.axis, dimension = axis === 'x' ? 'w' : 'd';
        const delta = block[axis] - this.top[axis], size = block[dimension];
        const perfect = Math.abs(delta) <= Math.min(0.18,size * 0.13);
        if (Math.abs(delta) >= size) {
            this.throwPiece(block.node,Math.sign(delta)*2,axis); this.active = null;
            this.phase = 'over'; this.message.string = '差一点点，再来一块！';
            this.subtitle.string = `这次的甜蜜高度：${this.count} 层`;
            this.hint.string = `${this.points} 分  ·  ${this.points >= this.best && this.points > 0 ? '你的最佳甜蜜纪录' : '下一次，一定可以更高'}`;
            this.action.string = '再叠一次  ↻'; return;
        }
        if (perfect) {
            block.x = this.top.x; block.z = this.top.z; this.combo++;
            this.points += this.combo >= 3 ? 3 : 2;
            this.message.string = this.combo >= 3 ? `完美 × ${this.combo}  ·  +3 分` : '正中间！  +2 分';
            this.sparkles(block);
        } else {
            this.combo = 0; this.points++;
            const remaining = size-Math.abs(delta);
            const cutCenter = block[axis] + Math.sign(delta)*remaining/2;
            const cut = this.solid('Falling slice',axis==='x'?cutCenter:block.x,block.y,axis==='z'?cutCenter:block.z,
                axis==='x'?Math.abs(delta):block.w,0.5,axis==='z'?Math.abs(delta):block.d,this.count%6);
            this.throwPiece(cut,Math.sign(delta)*2,axis);
            block[dimension] = remaining; block[axis] = (block[axis]+this.top[axis])/2;
            this.message.string = '稳稳接住  +1 分';
        }
        block.node.setPosition(block.x,block.y,block.z);
        block.node.setScale(block.w,0.5,block.d);
        tween(block.node).to(0.09,{scale:new Vec3(block.w*1.025,0.38,block.d*1.025)})
            .to(0.22,{scale:new Vec3(block.w,0.5,block.d)},{easing:'backOut'}).start();
        this.top = block; this.active = null; this.count++;
        if (this.points > this.best) { this.best = this.points; try { sys.localStorage.setItem('jelly-stack-best',String(this.best)); } catch (_) {} }
        this.updateScore(); this.hint.string = this.count < 3 ? '连续精准落下，获得额外连击分' : '保持节奏，让甜蜜继续长高';
        this.scheduleOnce(() => { this.phase = 'playing'; this.spawn(); },0.3);
    }
    private throwPiece(node: Node, speed: number, axis: 'x'|'z') {
        this.debris.push({node,vx:axis==='x'?speed:0,vz:axis==='z'?speed:0,vy:0,life:2});
    }
    private sparkles(block: Block) {
        for (let i=0;i<12;i++) {
            const a=i*Math.PI/6;
            const node=this.solid('Sugar sparkle',block.x+Math.cos(a)*block.w*0.6,block.y+0.2,block.z+Math.sin(a)*block.d*0.6,0.09,0.09,0.09,i%6);
            this.debris.push({node,vx:Math.cos(a)*1.3,vz:Math.sin(a)*1.3,vy:2,life:0.8});
        }
    }
    update(dt: number) {
        if (!this.initialized || !this.camera || this.paused) return;
        dt = Math.min(dt,0.05);
        if ((this.phase === 'ready' || this.phase === 'playing') && this.active) {
            this.elapsed += dt*(1.05+Math.min(this.count,30)*0.035);
            const a=this.active;
            a[this.axis]=this.top[this.axis]+Math.sin(this.elapsed)*MOVE_RANGE;
            a.node.setPosition(a.x,a.y+Math.sin(this.elapsed*2)*0.05,a.z);
        }
        this.cameraY += (this.targetY-this.cameraY)*Math.min(1,dt*4);
        this.camera.node.setPosition(10,9+this.cameraY,12);
        this.camera.node.lookAt(Vec3.add(new Vec3(), this.world.worldPosition, new Vec3(0,this.cameraY+0.5,0)));
        for (let i=this.debris.length-1;i>=0;i--) {
            const p=this.debris[i]; p.life-=dt; p.vy-=dt*12;
            const pos=p.node.position; p.node.setPosition(pos.x+p.vx*dt,pos.y+p.vy*dt,pos.z+p.vz*dt);
            p.node.setRotationFromEuler(p.node.eulerAngles.x+dt*95,p.node.eulerAngles.y,p.node.eulerAngles.z+dt*65);
            if(p.life<=0){p.node.destroy();this.debris.splice(i,1);}
        }
    }
    onDestroy() {
        // Child node listeners are disposed with the prefab; children may already
        // be destroyed here. Only detach listeners on global event sources.
        input.off(Input.EventType.KEY_DOWN,this.onKey,this); game.off(Game.EVENT_HIDE,this.onAppHide,this);
        this.unscheduleAllCallbacks();
        if (isValid(this.world)) this.world.children.forEach(n=>Tween.stopAllByTarget(n));
        this.materials.forEach(m=>m.destroy()); this.mesh?.destroy();
    }
}
