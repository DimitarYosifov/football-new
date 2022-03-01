import { App } from "./App";
import { Container, Sprite, AnimatedSprite, Texture, } from "pixi.js";
import { IAnimationData } from "./scenes/StandingsView";

export default class Animation   {

    public anim: AnimatedSprite;
    public data: any;

    constructor(data: IAnimationData) {
        // super();
        this.data = data;
        this.create();
    }

    private create() {
        let frames = [];
        for (let frame = 1; frame <= this.data.frames; frame++) {
            let current = `${this.data.name}_${frame}`;
            frames.push(current);
        }

        this.anim = new AnimatedSprite(frames.map((s) => Texture.from(s)));
        this.anim.animationSpeed = this.data.speed;
        this.anim.loop = this.data.loop;
        // this.addChild(this.anim);
        if (!this.data.paused) {
            this.anim.play();
        }

        return this;
    }
}
