import { Sprite, Texture } from "pixi.js";
import { App } from "../App";
import gsap from "gsap";

export class ActiveDefense extends Sprite {

    public color: string;
    private level: any;
    newY: number;
    newX: number;
    index: any;

    constructor(tintValue: number, initialX: number, initialY: number, color: string) {
        super();
        // this.stageWidth = this.app.stage.width;
        // this.stageHeight = this.app.stage.height;
        this.level = App.app.stage.getChildByName("level");
        this.texture = Texture.from("glove2");
        this.color = color;
        this.height = App.height * 0.05;
        this.scale.x = this.scale.y;
        this.anchor.set(0.5, 0.5);
        this.y = initialY;
        this.x = initialX;
        this.tint = +`0x${tintValue}`;
        let scaleValue = this.scale.x;
        gsap.to(this.scale, .5, {
            x: scaleValue * 2,
            y: scaleValue * 2
        });
        gsap.to(this.scale, .5, {
            delay: .5,
            x: scaleValue,
            y: scaleValue
        });

        if (App.isPlayerTurn) {
            let firstEmpty = this.level.playerActiveDefenses.findIndex((i: null) => i === null);
            this.index = firstEmpty;
            this.height = App.height * 0.05;
            this.width = this.height;
            this.newY = this.level.height * 0.84; //this.app.level.playerActiveDefensesY; ///WTF
            this.newX = this.width / 2 + firstEmpty * App.width / this.level.playerActiveDefenses.length;
            console.log(this.newX);
            console.log(this.newY);
            this.level.playerActiveDefenses[firstEmpty] = this;
        } else {
            let firstEmpty = this.level.opponentActiveDefenses.findIndex((i: null) => i === null);
            this.index = firstEmpty;
            this.height = App.height * 0.05;
            this.scale.x = this.scale.y;
            this.newY = this.level.height * 0.15; //this.app.level.opponentActiveDefensesY;
            this.newX = this.width / 2 + firstEmpty * App.width / this.level.opponentActiveDefenses.length;
            console.log(this.newX);
            console.log(this.newY);
            this.level.opponentActiveDefenses[firstEmpty] = this;
        }
        gsap.to(this, .5, {
            delay: .5,
            x: this.newX,
            y: this.newY
        });
    }
}
