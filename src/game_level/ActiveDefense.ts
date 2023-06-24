import { Sprite, Texture } from "pixi.js";
import { App } from "../App";
import gsap from "gsap";

export class ActiveDefense extends Sprite {

    public color: string;
    private level: any;
    newY: number;
    newX: number;
    index: any;

    constructor(tintValue: number | string, initialX: number, initialY: number, color: string, initialDefense: boolean = false, initialDefenseTarget: null | string = null) {
        super();
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

        if (initialDefense) {
            if (initialDefenseTarget === "player") {
                let firstEmpty = this.level.playerActiveDefenses.findIndex((i: null) => i === null);
                this.index = firstEmpty;
                this.height = App.height * 0.05;
                this.width = this.height;
                this.y = this.level.height * 0.84;
                this.x = this.width / 2 + firstEmpty * App.width / this.level.playerActiveDefenses.length;
                this.level.playerActiveDefenses[firstEmpty] = this;
                this.scale.x = this.scale.y;
                this.mix();
                return;
            } else {
                let firstEmpty = this.level.opponentActiveDefenses.findIndex((i: null) => i === null);
                this.index = firstEmpty;
                this.height = App.height * 0.05;
                this.scale.x = this.scale.y;
                this.y = this.level.height * 0.15;
                this.x = this.width / 2 + firstEmpty * App.width / this.level.opponentActiveDefenses.length;
                this.level.opponentActiveDefenses[firstEmpty] = this;
                this.mix();
                return;
            }
        }

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

    mix() {
        const iritations = 15;
        const interval = 0.1;
        const colors = [
            'FF1D00',   // RED
            '3052FF',   // BLUE
            '2F7F07',   // GREEN
            'E2D841',   // YELLOW
            'B200FF'    // PURPLE
        ]
        for (let index = 0; index < iritations; index++) {
            gsap.delayedCall(interval * (index + 1), () => {
                let rndColor = colors[Math.floor(Math.random() * 5)];
                this.tint = +`0x${rndColor}`;
            })
        }
    }
}