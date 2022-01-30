import { Container, Sprite } from "pixi.js";
import { IScene, Manager } from "../Manager";
import gsap from "gsap";

export class GameScene extends Container implements IScene {
    private clampy: Sprite;
    constructor() {
        super();
        // Inside assets.ts we have a line that says `{ name: "Clampy from assets.ts!", url: "./clampy.png" }`
        this.clampy = Sprite.from("Clampy from assets.ts!");

        this.clampy.anchor.set(0.5);
        this.clampy.x = 0;
        this.clampy.y = Manager.height / 2;
        this.addChild(this.clampy);

        gsap.to(this.clampy, 4, {
            x: Manager.width * 1,
            yoyo: true,
            repeat: -1
        })
    }
    public update(framesPassed: number): void {

        framesPassed = framesPassed;
        // Lets move clampy!
        // this.clampy.x += this.clampyVelocity * framesPassed;

        // if (this.clampy.x > Manager.width) {
        //     this.clampy.x = Manager.width;
        //     this.clampyVelocity = -this.clampyVelocity;
        // }

        // if (this.clampy.x < 0) {
        //     this.clampy.x = 0;
        //     this.clampyVelocity = -this.clampyVelocity; 
        // }
    }
}
