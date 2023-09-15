import Block from "./Block";
import { config } from "../configs/MainGameConfig";
import { Container, Graphics, Point, Sprite, TextStyle, Texture, Text, InteractionEvent } from "pixi.js";
import { App } from "../App";
import Grid from "./Grid";
import { gsap } from "gsap";
import * as grid_interfaces from "./grid_interfaces"
import { IShopItemsConfig } from "../scenes/SpecialsView";
import { ServerRequest } from "../ServerRequest";
import { GlowFilter } from "pixi-filters";

export default class Specials extends Container {

    private level: any;
    private isPlayer: boolean;
    private popupContainer: Container;
    private isSpecialStarted: boolean = false;

    constructor(player: string) {
        super();
        this.isPlayer = player === "player";
        this.level = App.app.stage.getChildByName("level");
        this.x = 5;
        this.y = this.isPlayer ? 600 : 200;

        let counter = 0;
        App.playerSpecials.forEach((special, index) => {
            let inUse = special.inUse;
            while (inUse! > 0) {
                this.createSpecial(special, counter)
                inUse!--;
                counter++;
            }
        });
    }

    private createSpecial(special: IShopItemsConfig, index: number): void {

        let specialSprite = Sprite.from(`${special.img}`);
        specialSprite.width = App.width * 0.08;
        specialSprite.scale.y = specialSprite.scale.x;
        specialSprite.anchor.set(0, 0);
        specialSprite.y = App.width * 0.1 * index;
        this.addChild(specialSprite);

        specialSprite.interactive = true;
        specialSprite.buttonMode = true;

        if (special.name === "Col Collector") {
            specialSprite.angle = 90;
            specialSprite.x += specialSprite.width;
        }

        specialSprite.on('pointerdown', () => {
            if (!App.isPlayerTurn || this.level.animationInProgress || App.specialInProgress) {
                return;
            }
            App.specialInProgress = true;
            specialSprite.interactive = false;
            specialSprite.buttonMode = false;
            specialSprite.alpha = 0.25;

            switch (special.name) {
                case "Row Collector":
                    this.destroyRow();
                    break;
                case "Col Collector":
                    this.destroyCol();
                    break;
                case "Color Collector":
                    this.destroyColor();
                    break;
                default:
                    console.warn("special not found...");
                    break;
            }
        });
    }

    private createPopup(): void {
        this.popupContainer = new Container();
        this.popupContainer.alpha = 0;
        this.level.addChild(this.popupContainer);
        let grid = this.level.grid;
        //bg1-----------------------------------------------------
        let bg = new Graphics();
        bg.beginFill(0x000000, 0.65);
        // bg.lineStyle(2, 0x000000, 0.5);
        bg.drawPolygon(
            [
                new Point(0, grid.getLocalBounds().y),
                new Point(grid.getLocalBounds().x, grid.getLocalBounds().y),
                new Point(grid.getLocalBounds().x, App.height),
                new Point(0, App.height),
            ]
        );
        bg.endFill();
        this.popupContainer.addChild(bg);
        bg.interactive = true;
        //bg2----------------------------------------------------
        let bg2 = new Graphics();
        bg2.beginFill(0x000000, 0.65);
        bg2.drawPolygon(
            [
                new Point(0, 0),
                new Point(App.width, 0),
                new Point(App.width, grid.getLocalBounds().y),
                new Point(0, grid.getLocalBounds().y),
            ]
        );
        bg2.endFill();
        this.popupContainer.addChild(bg2);
        bg2.interactive = true;
        //bg3----------------------------------------------------
        let bg3 = new Graphics();
        bg3.beginFill(0x000000, 0.65);
        bg3.drawPolygon(
            [
                new Point(grid.getLocalBounds().x, grid.getLocalBounds().y + grid.getLocalBounds().height),
                new Point(App.width, grid.getLocalBounds().y + grid.getLocalBounds().height),
                new Point(App.width, App.height),
                new Point(grid.getLocalBounds().x, App.height),
            ]
        );
        bg3.endFill();
        this.popupContainer.addChild(bg3);
        bg3.interactive = true;
        //bg4----------------------------------------------------
        let bg4 = new Graphics();
        bg4.beginFill(0x000000, 0.65);
        bg4.drawPolygon(
            [
                new Point(grid.getLocalBounds().x + grid.getLocalBounds().width, grid.getLocalBounds().y),
                new Point(App.width, grid.getLocalBounds().y),
                new Point(App.width, grid.getLocalBounds().y + grid.getLocalBounds().height),
                new Point(grid.getLocalBounds().x + grid.getLocalBounds().width, grid.getLocalBounds().y + grid.getLocalBounds().height),
            ]
        );
        bg4.endFill();
        this.popupContainer.addChild(bg4);
        bg4.interactive = true;
        gsap.to(this.popupContainer, 0.5, {
            ease: "Back.easeIn",
            alpha: 1,
            onComplete: () => { }
        });
    }

    private createDescription(msg: string, specialType: string): void {
        const style: TextStyle = new TextStyle({
            fontFamily: config.mainFont,
            fill: '#32cf56',
            align: 'center',
            stroke: '#000000',
            fontWeight: "800",
            lineJoin: "bevel",
            strokeThickness: 6
        });

        let text = new Text(msg, style);
        text.anchor.set(0.5);
        text.style.fontSize = App.height / 10;
        text.position.set(- 400, App.height / 2);
        this.popupContainer.addChild(text);

        gsap.to(text, 0.35, {
            delay: .5,
            ease: "Back.easeOut",
            x: App.width / 2,
            onComplete: () => { }
        });
        gsap.to(text, 0.35, {
            delay: 2.5,
            ease: "Back.easeIn",
            x: App.width + 400,
            onComplete: () => {
                text.destroy();
                this.createInteractiveLayer(specialType);
            }
        });
    }

    private createInteractiveLayer(specialType: string,): void {
        let w = this.level.grid.width / 6;
        let startx = this.level.grid.getLocalBounds().x;
        let starty = this.level.grid.getLocalBounds().y;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 6; col++) {

                let layer = new Graphics();
                layer.beginFill(0x00ffd0, 0.01);
                layer.drawRect(
                    startx + col * w,
                    starty + row * w,
                    w,
                    w
                );
                layer.endFill();
                this.popupContainer.addChild(layer);
                layer.interactive = true;
                layer.buttonMode = true;

                let selected = (e: InteractionEvent) => {
                    let targetColor = (this.level.grid.blocks as any)[row][col].img;
                    let forbiddenTypes: string[] = ["yellow_card", "red_card", "red_cross"];
                    if (forbiddenTypes.includes(targetColor) || this.isSpecialStarted) return;
                    this.isSpecialStarted = true;
                    console.log(row, col);
                    gsap.to(this.popupContainer, 1, {
                        ease: "Back.easeIn",
                        alpha: 0,
                        onComplete: () => {
                            this.startSpecial(row, col, specialType);
                        }
                    });
                }
                layer.on('pointerdown', selected);
            }
        }
    }

    private destroyRow() {
        this.createPopup();
        this.createDescription("Select Row", "RowCollector");
    }

    private destroyCol(): void {
        this.createPopup();
        this.createDescription("Select Col", "ColCollector");
    }

    private destroyColor(): void {
        this.createPopup();
        this.createDescription("Select\nColor", "ColorCollector");
    }

    private startSpecial(row: number, col: number, specialType: string): void {

        if (specialType === "RowCollector") {
            let matches: grid_interfaces.IMatches[] = [];
            let blocksOnRow = this.level.grid.blocks[row];
            blocksOnRow.forEach((block: any, index: number) => {
                let blockData: grid_interfaces.IMatches = {
                    beingSwapped: false,
                    col: block.col,
                    dir: "",
                    id: 1, // WTF
                    row: block.row,
                    type: block.img
                }
                matches.push(blockData);
            });

            let specialSprite = Sprite.from(`twoSidedArrow`);
            specialSprite.width = App.width * 0.1;
            specialSprite.scale.y = specialSprite.scale.x * 1.5;
            specialSprite.anchor.set(0.5);
            specialSprite.x = this.popupContainer.width / 2;
            specialSprite.y = blocksOnRow[0].getLocalBounds().y + blocksOnRow[0].height / 2;

            this.popupContainer.removeChild();
            this.popupContainer.alpha = 1;
            this.popupContainer.addChild(specialSprite);

            gsap.to(specialSprite, 0.4, {
                ease: "Back.easeIn",
                width: this.popupContainer.width * 0.9,
                onComplete: () => {
                    this.level.grid.playMatchAnimations(matches);
                    this.level.grid.increaseCardsPointsAfterMatch(matches);
                    this.isSpecialStarted = false;
                }
            });
            gsap.to(specialSprite, 0.4, {
                alpha: 0,
                delay: 0.4,
                onComplete: () => {
                    let type: any = App.playerSpecials.find(x => x._name === specialType);
                    type.inUse--;
                    this.updateBackend();
                    this.popupContainer.destroy();
                }
            });

        }

        else if (specialType === "ColCollector") {
            let matches: grid_interfaces.IMatches[] = [];
            let blocksInCol = (this.level.grid.blocks as any).map((x: any[]) => x[col])
            console.log(blocksInCol);
            blocksInCol.forEach((block: any, index: number) => {
                let blockData: grid_interfaces.IMatches = {
                    beingSwapped: false,
                    col: block.col,
                    dir: "",
                    id: 1, // WTF
                    row: block.row,
                    type: block.img
                }
                matches.push(blockData);
            });

            let specialSprite = Sprite.from(`twoSidedArrow`);
            specialSprite.width = App.width * 0.1;
            specialSprite.scale.y = specialSprite.scale.x * 1.5;
            specialSprite.anchor.set(0.5);
            specialSprite.x = blocksInCol[0].getLocalBounds().x + blocksInCol[0].width / 2;
            specialSprite.y = this.popupContainer.height / 2;
            specialSprite.angle = 90;

            this.popupContainer.removeChild();
            this.popupContainer.alpha = 1;
            this.popupContainer.addChild(specialSprite);

            gsap.to(specialSprite, 0.4, {
                ease: "Back.easeIn",
                width: this.popupContainer.width * 0.9,
                onComplete: () => {
                    this.level.grid.playMatchAnimations(matches);
                    this.level.grid.increaseCardsPointsAfterMatch(matches);
                    this.isSpecialStarted = false;
                }
            });
            gsap.to(specialSprite, 0.4, {
                alpha: 0,
                delay: 0.4,
                onComplete: () => {
                    let type: any = App.playerSpecials.find(x => x._name === specialType);
                    type.inUse--;
                    this.updateBackend();
                    this.popupContainer.destroy();
                }
            });
        }

        else if (specialType === "ColorCollector") {
            let matches: grid_interfaces.IMatches[] = [];
            let targetColor = (this.level.grid.blocks as any)[row][col].img;

            let colors: any = {
                "ball_red": "0xFF1D00",     // RED:
                "ball_blue": "0x3052FF",    // BLUE:
                "ball_green": "0x2F7F07",   // GREEN:
                "ball_yellow": "0xE2D841",  // YELLOW:
                "ball_purple": "0xB200FF"   // PURPLE:
            }
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 6; c++) {
                    let currentBlock = (this.level.grid.blocks as any)[r][c];
                    let currentColor = currentBlock.img;

                    if (currentColor === targetColor) {
                        console.log(currentBlock);
                        let blockData: grid_interfaces.IMatches = {
                            beingSwapped: false,
                            col: currentBlock.col,
                            dir: "",
                            id: 1,
                            row: currentBlock.row,
                            type: currentColor
                        }
                        matches.push(blockData);
                        let startScale = currentBlock.blockImg.scale.x;
                        gsap.to(currentBlock.blockImg.scale, 0.35, {
                            ease: "Back.easeIn",
                            x: startScale * 1.1,
                            y: startScale * 1.1,
                            yoyo: true,
                            repeat: 6,
                            onStart: () => {
                                console.log(currentBlock.blockImg);
                                let filter = new GlowFilter({
                                    distance: 17,// higher value is not working on mobile !!!!
                                    outerStrength: 5,
                                    innerStrength: 0,
                                    // color: 0xf43636,
                                    color: colors[currentColor],
                                    quality: 1,
                                    knockout: false,
                                })
                                currentBlock.blockImg.filters = [filter];
                            },
                            onComplete: () => {
                                currentBlock.blockImg.filters = [];
                            }
                        });
                    }
                }
            }
            console.log(matches);
            this.popupContainer.removeChildren();
            this.popupContainer.alpha = 1;
            gsap.delayedCall(2.15, () => {
                let type: any = App.playerSpecials.find(x => x._name === specialType);
                type.inUse--;
                this.updateBackend();
                this.popupContainer.destroy();
                this.level.grid.playMatchAnimations(matches);
                this.level.grid.increaseCardsPointsAfterMatch(matches);
                this.isSpecialStarted = false;
            })
        }
    }

    private updateBackend(): void {
        ServerRequest(
            "updateSpecials",
            JSON.stringify({
                user: App.user,
                playerCash: App.playerCash,
                playerSpecials: App.playerSpecials,
            }),
            "POST"
        ).then((res: any) => {
            console.log(res);
        });
    }
}
