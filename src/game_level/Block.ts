// import Config from "../Config.js";
// import Grid from "./Grid.js";
// import GameTexture from "../GameTexture.js"

import { Container, InteractionEvent, Sprite, Texture } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import Grid from "./Grid";
import gsap from "gsap";
import WSConnection from "../scenes/PVP/WSConnection";

export default class Block extends Container {

    private level: any;
    private grid: Grid;
    public row: number;
    public col: number;
    private rowContainer: Container;
    private moveCoordinates: IMoveCoordinates;
    public img: Sprite | string;
    public blockImg: Sprite;
    public type: Sprite | string;

    constructor(row: number, col: number, rowContainer: Container) {
        super();
        this.level = App.app.stage.getChildByName("level");
        this.grid = this.level.grid;
        this.row = row;
        this.col = col;
        this.rowContainer = rowContainer;
        this.moveCoordinates = { startX: 0, startY: 0, lastX: 0, lastY: 0 }
        this.create();
    }

    private create() {
        let figureMissing: boolean | undefined = true;
        // check if grid is predefined(debug purposes)
        if (!config.isGridInDebug) {
            while (figureMissing) {
                this.img = this.generateRandomColorBlock();
                // console.log(this.img);
                this.type = this.img;
                figureMissing = this.createNonMatchingGrid(this.row, this.col, this.img);
            }
        } else {
            this.img = config.debugGrid[this.row][this.col];
        }
        this.grid.PVP_grid[this.row][this.col] = (this.img);

        this.blockImg = Sprite.from(`${this.img}`);
        this.interactive = true;
        // this.buttonMode = true;
        this.blockImg.anchor.x = 0.5; //??????????????????
        this.blockImg.anchor.y = 0.5; //??????????????????
        (this.blockImg as any).gridPosition_x = this.row;
        (this.blockImg as any).gridPosition_y = this.col;
        // this.type = this.img;

        let grid_h = App.height * 0.65;
        let grid_w = grid_h * 0.75;
        let block_w = grid_w / 6
        let block_h = grid_h / 8;
        let grid_y = block_h / 2 + (App.height - grid_h) / 2;
        let grid_x = block_h / 2 + ((App.width - grid_w) / 2);

        this.blockImg.x = grid_x + block_w * this.col;
        this.blockImg.y = grid_y + block_h * this.row;
        this.blockImg.width = block_h * 0.9;
        this.blockImg.height = block_h * 0.9;

        this.grid.globalBlocksPositions[this.row].push({
            x: this.blockImg.x,
            y: this.blockImg.y
        })

        this.blockImg.alpha = 0;;
        this.addChild(this.blockImg);    ///This not row container!!!!!

        let delay = this.row * 90 + this.col * 15 + config.fadeTimeBetweenPhases * 1000 + 1750;
        if (App.isPlayerHome && App.pvpGame) {
            if (this.row === 7 && this.col === 5) {
                //  BIG TODO HERE!!!!
                setTimeout(() => {
                    WSConnection.PVP_gridCreated(this.grid.PVP_grid);
                }, 100);
            }
            gsap.delayedCall(delay / 1000, () => {
                this.blockImg.alpha = 1;
                if (this.row === 7 && this.col === 5) {
                    this.grid.newRound();
                }
            })
        }
        else if (!App.isPlayerHome && App.pvpGame) {
            //wait for websocket data!!
            App.EE.once("pvp_grid_data", (grid) => {
                this.img = grid[this.row][this.col];
                this.type = grid[this.row][this.col];
                this.blockImg.texture = Texture.from(grid[this.row][this.col]);
                gsap.delayedCall(delay / 1000, () => {
                    this.blockImg.alpha = 1;
                    if (this.row === 7 && this.col === 5) {
                        this.grid.newRound();
                    }
                })
            });
        }
        else if (!App.pvpGame) {
            App.EE.once("initial_random_rewards", () => {
                gsap.delayedCall(delay / 1000, () => {
                    this.blockImg.alpha = 1;
                    if (this.row === 7 && this.col === 5) {
                        this.grid.newRound();
                    }
                })
            });

        }


        this.on('pointerdown', this.onDragStart);
        this.on('pointerup', this.onDragEnd)
        // block.on('pointerupoutside', onDragEnd)
        this.on('pointermove', this.onDragMove)
    }

    private generateRandomColorBlock(): string {
        if (config.predefinedBlockColor) { return config.predefinedBlockColor };
        // note - same method is used server side for PVP games...
        let x = Math.floor(Math.random() * 100) + 1;
        let a;
        switch (true) {
            //blocks - 18%       yellow card - 6%     red card- 2%      injury - 2%
            case x <= 18:
                a = "ball_blue";
                break;
            case (x > 18 && x <= 36):
                a = "ball_green";
                break;
            case x > 36 && x <= 54:
                a = "ball_purple";
                break;
            case x > 54 && x <= 72:
                a = "ball_red";
                break;
            case x > 72 && x <= 90:
                a = "ball_yellow";
                break;
            case x > 90 && x <= 96:
                a = "yellow_card";
                break;
            case x > 96 && x <= 98:
                a = "red_card";
                break;
            case x > 98 && x <= 100:
                a = "red_cross";
                break;
            default:
                a = "error";
                break;
        }
        return a;
    }

    public createNonMatchingGrid(_row: number, _col: number, img: string | Sprite): boolean | undefined {
        let checkLeft = () => {
            if (_col < 2) {
                return false;
            }
            let matches = 1;
            for (let col = 1; col < 3; col++) {
                if (img === (this.rowContainer.children[_col - col] as any).type) {
                    matches++;
                    if (matches === 3) {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        };

        let checkUp = () => {
            if (_row < 2) {
                return false;
            }
            let matches = 1;
            for (let row = 1; row < 3; row++) {
                if (img === (this.grid.children[_row - row] as any).children[_col].type) {
                    matches++;
                    if (matches === 3) {
                        return true;
                    }
                } else {
                    return false;
                }
            }
        };
        return checkUp() || checkLeft();
    }

    public onDragStart = (e: InteractionEvent) => {
        if (!this.level.autoplayMode) {
            (e as any).gridPosition_x = this.col;
            (e as any).gridPosition_y = this.row;
            this.grid.onDragStart(e);
        }
    }

    public onDragMove = (e: InteractionEvent) => {
        this.grid.onDragMove(e);
    }

    public onDragEnd = (e: InteractionEvent) => {
        this.grid.onDragEnd(e);
    }
}

export interface IMoveCoordinates {
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
}
