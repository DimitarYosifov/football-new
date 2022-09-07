import { Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import { createText } from "../createText";

export default class WaitingOpponentPopup extends Container {

    private text: Text;
    private bg: Graphics;
    private interval: NodeJS.Timeout
    private opponentLeft: boolean;
    private continueBtn: Sprite;
    private continueBtnLabel: Text;
    constructor(opponentLeft: boolean) {
        super();
        this.opponentLeft = opponentLeft
        this.create();
    }

    private create() {

        //BG
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, this.opponentLeft ? 1 : 0.75);
        this.bg.drawRect(
            0,
            0,
            App.width,
            App.height
        );
        this.bg.endFill();
        this.addChild(this.bg);
        const style = new TextStyle({
            fontFamily: config.mainFont,
            fill: '#000000',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 1.5
        });
        let text = this.opponentLeft ? "Opponent\nleft" : 'Waiting for \n for opponent...';
        this.text = createText(text, style, this, App.height / 2, App.width / 2, 0.5, 0.5, App.height / 14);

        if (this.opponentLeft) {
            this.continueBtn = Sprite.from("btn1");
            this.continueBtn.height = App.height * 0.1;
            this.continueBtn.scale.x = this.continueBtn.scale.y;
            this.continueBtn.x = App.width / 2;
            this.continueBtn.y = App.height * 0.8;
            this.continueBtn.anchor.set(0.5);
            this.continueBtn.interactive = true;
            this.continueBtn.buttonMode = true;
            this.continueBtn.on('pointerdown', () => {
                location.reload();
            });
            this.addChild(this.continueBtn);

            this.continueBtnLabel = new Text(`OK`, {
                fontFamily: config.mainFont,
                fontSize: this.continueBtn.height / 2.5,
                fill: '#ffffff',
                align: 'center',
                stroke: '#000000',
                fontWeight: "800",
                lineJoin: "bevel",
                strokeThickness: 6
            });
            this.continueBtnLabel.position.set(
                this.continueBtn.x,
                this.continueBtn.y
            );
            this.continueBtnLabel.anchor.set(0.5, 0.5);
            this.addChild(this.continueBtnLabel);
        }
    }
}
