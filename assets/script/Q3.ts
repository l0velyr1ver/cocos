const { ccclass, property } = cc._decorator;
@ccclass
export class PlayButtonAnim extends cc.Component {
    // 按钮按下缩放比例
    @property({ tooltip: "按钮按下时的缩放比例" })
    private pressScaleFactor: number = 0.9;

    // 动画参数配置
    @property({ tooltip: "按下初始动画时长" })
    private pressDuration: number = 0.1;
    @property({ tooltip: "按下弹性动画时长" })
    private pressElasticDuration: number = 0.4;
    @property({ tooltip: "释放初始动画时长" })
    private releaseDuration: number = 0.1;
    @property({ tooltip: "释放弹性动画时长" })
    private releaseElasticDuration: number = 0.3;
    @property({ tooltip: "弹性动画频率" })
    private elasticFreq: number = 2;
    @property({ tooltip: "弹性动画衰减系数" })
    private elasticDecay: number = 1;

    // 呼吸动画参数
    @property({ tooltip: "呼吸动画横向缩放比例" })
    private breathScaleX: number = 1.07;
    @property({ tooltip: "呼吸动画纵向缩放比例" })
    private breathScaleY: number = 0.93;
    @property({ tooltip: "呼吸动画第一阶段时长" })
    private breathPhase1: number = 0.35;
    @property({ tooltip: "呼吸动画第二阶段时长" })
    private breathPhase2: number = 0.45;

    private idleTween: cc.Tween; // 呼吸动画实例

    onLoad() {
        // this.node.active = false;
    }

    start() {
        this.registerButtonEvents();
        this.showAnimation()
    }

    // 启动呼吸动画
    private startIdleAnimation(baseScale: number) {
        this.stopIdleAnimation();

        this.idleTween = cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .to(this.breathPhase1, { 
                        scaleX: this.breathScaleX * baseScale, 
                        scaleY: this.breathScaleY * baseScale 
                    }, { easing: "sineOut" })
                    .to(this.breathPhase2, { 
                        scaleX: baseScale, 
                        scaleY: baseScale 
                    }, { easing: "sineOut" })
            )
            .start();
    }

    // 停止呼吸动画
    private stopIdleAnimation() {
        if (this.idleTween) {
            this.idleTween.stop();
            this.idleTween = null;
        }
    }

    // 注册按钮事件
    private registerButtonEvents() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onButtonPress, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onButtonRelease, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onButtonRelease, this);
    }

    // 按钮按下处理
    private onButtonPress() {
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(this.pressDuration, { scale: this.pressScaleFactor }, { 
                easing: "sineOut" 
            })
            .to(this.pressElasticDuration, { scale: this.pressScaleFactor }, { 
                progress: this.createElasticProgress() 
            })
            .call(() => this.startIdleAnimation(this.pressScaleFactor))
            .start();
    }

    // 按钮释放处理
    private onButtonRelease() {
        cc.Tween.stopAllByTarget(this.node);
        cc.tween(this.node)
            .to(this.releaseDuration, { scale: 1 }, { 
                easing: "sineOut" 
            })
            .to(this.releaseElasticDuration, { scale: 1 }, { 
                progress: this.createElasticProgress() 
            })
            .call(() => this.startIdleAnimation(1))
            .start();
    }

    private showAnimation(){
        cc.Tween.stopAllByTarget(this.node);
        let anim = this.getComponent(cc.Animation);
        anim.play();
    }

    onAnimationCompleted(num:number, string:string) {
        cc.tween(this.node)
        .to(this.releaseDuration, { scale: 1 }, { 
            easing: "sineOut" 
        })
        .call(() => this.startIdleAnimation(1))
        .start();
    }

    // 创建弹性动画progress函数
    private createElasticProgress(): (start: number, end: number, 
        current: number, ratio: number) => number {
        const w = this.elasticFreq * Math.PI * 2;
        return (start, end, current, ratio) => {
            return end + end * (Math.sin(ratio * w) / Math.exp(this.elasticDecay * ratio) / w);
        };
    }
}