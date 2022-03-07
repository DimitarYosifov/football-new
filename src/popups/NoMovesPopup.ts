import { Container, Text, TextStyle } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import { createText } from "../createText";
export default class NoMovesPopup extends Container {

    private text: Text;

    constructor() {
        super();
        this.create();
    }

    private create() {
        const style = new TextStyle({
            fontFamily: config.mainFont,
            fontSize: App.height / 8,
            fill: '#000000',
            align: 'center',
            stroke: '#ffffff',
            strokeThickness: 7
        });
        this.text = createText('No Moves', style, this, App.height / 2, App.width / 2, 0.5, 0.5, App.height / 8);
    }
}
