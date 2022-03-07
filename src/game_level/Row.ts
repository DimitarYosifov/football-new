import Block from "./Block";
import { config } from "../configs/MainGameConfig";
import { Container, Texture } from "pixi.js";
import { App } from "../App";
import Grid from "./Grid";

export default class Row extends Container {

    private level: any;
    private rowId: number;
    private grid: Grid;
    public img: Texture;

    constructor(row: number) {
        super();
        this.level = App.app.stage.getChildByName("level");
        setTimeout(() => {
            this.rowId = row;
            this.grid = this.level.grid;
            this.create();
        }, 0);
    }

    private create() {
        for (let col = 0; col < 6; col++) {
            let block = new Block(this.rowId, col, this);
            // console.log(this.rowId);
            this.addChild(block);
            (this.grid.blocks[this.rowId] as any).push(block);
        }
    }
}
