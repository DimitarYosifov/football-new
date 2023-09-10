import Block from "./Block";
import { config } from "../configs/MainGameConfig";
import { Container, Graphics, Point, Sprite, TextStyle, Texture, Text, InteractionEvent } from "pixi.js";
import { App } from "../App";
import Grid from "./Grid";
import { gsap } from "gsap";
import * as grid_interfaces from "./grid_interfaces"
import { IShopItemsConfig } from "../scenes/SpecialsView";

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
            console.log(this.level.animationInProgress);

            if (!App.isPlayerTurn || this.level.animationInProgress) {
                return;
            }
            App.specialInProgress = true;
            App.specialInProgress = true;
            specialSprite.interactive = false;
            specialSprite.buttonMode = false;
            specialSprite.alpha = 0.25;

            switch (special.name) {
                case "Row Collector":
                    this.destroyRow();
                    break;
                case "Col Collector":
                    // this.destroyCol();
                    break;
                case "Random Color Collector":
                    // this.destroyRandomColor();
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
                    if (this.isSpecialStarted) return;
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
        this.createDescription("Select Row", "destroyRow");
    }

    private startSpecial(row: number, col: number, specialType: string): void {

        if (specialType === "destroyRow") {
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
                    this.popupContainer.destroy();
                }
            });

        }
    }
}
