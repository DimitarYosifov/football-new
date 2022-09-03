import { Container, Graphics, Text, TextStyle } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import { createText } from "../createText";

export default class WaitingOpponentPopup extends Container {

    private text: Text;
    private bg: Graphics;
    private interval: NodeJS.Timeout
    constructor() {
        super();
        this.create();
    }

    private create() {

        //BG
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0.75);
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
        this.text = createText('Waiting for \n for opponent...', style, this, App.height / 2, App.width / 2, 0.5, 0.5, App.height / 14);
    }
}
