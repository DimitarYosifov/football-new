import dragonBones from "pixi-dragonbones";

import * as PIXI from 'pixi.js';


type EventStringType = "start" | "loopComplete" | "complete" | "fadeIn" | "fadeInComplete" | "fadeOut" | "fadeOutComplete" | "frameEvent" | "soundEvent";
export default class DragonBonesAnimation {
    public armatureDisplay: dragonBones.PixiArmatureDisplay | null
    protected armatureName: string
    protected completeFn: DBEventObject

    constructor(armatureName: string, skeletonData: any, spriteSheet: any, spriteSheetImage: any) {


        (PIXI as any).ticker = PIXI.Ticker;
        (PIXI as any).mesh = { Mesh: PIXI.Mesh };
        (PIXI as any).mesh.Mesh.DRAW_MODES = {};


        const pixiFactory = dragonBones.PixiFactory.factory;

        if (!pixiFactory.getDragonBonesData(armatureName)) {
            pixiFactory.parseDragonBonesData(skeletonData);
            pixiFactory.parseTextureAtlasData(spriteSheet, spriteSheetImage);
        }
        this.armatureDisplay = pixiFactory.buildArmatureDisplay(armatureName);
        this.armatureName = armatureName
    }
    /**
     * 
     * @param frames - Changes frame rate of the animation. 
     * @returns Current frameRate
     */
    frameRate(frames?: number): number {
        if (frames)
            this.armatureDisplay!.armature.armatureData.frameRate = frames
        return this.armatureDisplay!.armature.armatureData.frameRate
    }
    /**
     * 
     * @param scale - Scale time of the animation. [default is 1, [0<1]: slows animation, [1<N] speeds up the animation]
     */
    timeScale(scale: number = 1): void {
        this.armatureDisplay!.animation.timeScale = scale
    }
    /**
     * - Play a specific animation.
     * @param animationName - The name of animation data. (If not set, The default animation will be played, or resume the animation playing from pause status, or replay the last playing animation)
     * @param playTimes - Playing repeat times. [-1: Use default value of the animation data, 0: No end loop playing, [1~N]: Repeat N times] (default: -1)
     * @returns The playing animation state.
     * @example
     * <pre>
     *     armature.animation.play("walk");
     * </pre>
     */
    play(animationName?: string, playTimes?: number): dragonBones.AnimationState | null {
        // let fps = App.instance.ticker.FPS;
        // this.timeScale(fps / 60);
        return this.armatureDisplay!.animation.play(animationName, playTimes)
    }
    /**
     * - Play a specific animation from the specific frame.
     * @param animationName - The name of animation data.
     * @param frame - The start frame of playing.
     * @param playTimes - Playing repeat times. [-1: Use the default value of animation data, 0: No end loop playing, [1~N]: Repeat N times] (Default: -1)
     * @returns The played animation state.
     */
    gotoAndPlayByFrame(animationName: string, frame?: number, playTimes?: number): dragonBones.AnimationState | null {
        return this.armatureDisplay!.animation.gotoAndPlayByFrame(animationName, frame, playTimes)
    }
    /**
     * - Pause a specific animation state.
     * @param animationName - The name of animation state. (If not set, it will pause all animations)
     */
    stop(animationName?: string) {
        this.armatureDisplay!.animation.stop(animationName)
    }
    /**
     * - Stops and Remove animationam from parent.
     */
    destroy(): void {
        this.armatureDisplay!.animation.stop()
        if ((this.armatureDisplay! as any).parent) {
            (this.armatureDisplay! as any).parent.removeChild(this.armatureDisplay)
        }
        this.armatureDisplay = null;
        (this.completeFn as any) = null
    }
    addDBEventListener(type: EventStringType, listener: () => void, context: any = this): void {
        if (type === dragonBones.EventObject.COMPLETE) this.completeFn = { type, listener, context }
        this.armatureDisplay!.addDBEventListener(type, listener, context)
    }
    removeDBEventListener(type: EventStringType, listener: () => void, context: any = this): void {
        if (type === dragonBones.EventObject.COMPLETE) (this.completeFn as any) = null
        this.armatureDisplay!.removeDBEventListener(type, listener, context)
    }
    /**
     * - Emits Complete event, if it is not fired at the end of the animation.
     * - Event is fired automaticaly from App gameLoopFunction, don't use it! 
     */
    sendFailsafeEvent(): void {
        if (this.armatureDisplay!.armature.eventDispatcher.hasDBEventListener(dragonBones.EventObject.COMPLETE) && this.armatureDisplay!.animation.isCompleted) {
            const completeEvent = dragonBones.BaseObject.borrowObject(dragonBones.EventObject);
            completeEvent.type = dragonBones.EventObject.COMPLETE;
            completeEvent.armature = this.armatureDisplay!.armature;
            (completeEvent as any).animationState = this.armatureDisplay!.animation.lastAnimationState;

            this.armatureDisplay!.armature.eventDispatcher.dispatchDBEvent(completeEvent.type, completeEvent)
            if (this.completeFn)
                this.removeDBEventListener(this.completeFn.type, this.completeFn.listener, this.completeFn.context)
            console.log('%c failsafeEvent', 'color:#7600bc');//TODO: delete
        }
    }

}

interface DBEventObject { type: EventStringType, listener: () => void, context: any }
