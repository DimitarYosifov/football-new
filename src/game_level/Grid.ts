import { AnimatedSprite, Container, Graphics, InteractionEvent, Sprite, Text, Texture } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import * as grid_interfaces from "./grid_interfaces"
import gsap from "gsap";
import { Card } from "./Card";
import { ActiveDefense } from "./ActiveDefense";
import NewRoundPopup from "../popups/NewRoundPopup";
import NoMovesPopup from "../popups/NoMovesPopup";
import Block from "./Block";
import Row from "./Row";
import { smartMove } from "./smartMove";
import WSConnection from "../scenes/PVP/WSConnection";
import { GlowFilter } from "pixi-filters";

export default class Grid extends Container {

    private moveCoordinates: grid_interfaces.IMoveCoordinates;
    private gridArrays: [Sprite | null][] = [];
    public globalBlocksPositions: any[][] = [[], [], [], [], [], [], [], []];
    public blocks: grid_interfaces.IBlockPositions[][] = [[], [], [], [], [], [], [], []];
    private dragging: boolean;
    private swapDirection: string;  //???
    private selectedBlock: grid_interfaces.ISelectedBlock;
    private blockBeingSwappedWith: grid_interfaces.ISelectedBlock;
    private level: any;
    private hintTimeout: GSAPTween;
    private hintInterval: GSAPTween;
    private matchingSwappedItem: number;
    private nextRoundDelay: number;
    private hintMatch: grid_interfaces.IPossibleMoves;
    private bestPossibleMove: grid_interfaces.IPossibleMoves;
    private noMoves: boolean;
    private hasGoalsInThisRound: boolean;
    private goalText: Text;
    private popup: NoMovesPopup | NewRoundPopup;
    private holesInColumns: grid_interfaces.IHolesInColumns[];
    public PVP_grid: any = [...Array(8)].map(e => Array(6));
    public gridPosition_x: number;
    public gridPosition_y: number;
    public data: any;  ///??????????????
    private PvP_newBlocks: string[] = [];
    private fallingBlocksOnColumn: any = {};
    private delayStep: number = 0.05
    private fallTweenDuration: number = 0.35;
    private hintTween1: gsap.core.Tween;
    private hintTween2: gsap.core.Tween;

    constructor() {
        super();
        this.level = App.app.stage.getChildByName("level");
        this.moveCoordinates = { startX: 0, startY: 0, lastX: 0, lastY: 0 }
        this.interactive = true;
        this.createGrid();
        if (App.pvpGame) {
            App.EE.on("PvP_moveData_received", (moveData) => {
                this.PvP_moveData_received(moveData);
            });
            App.EE.on("new_blocks_received", (newBlocks) => {
                this.PvP_newBlocks = newBlocks;
                //  gsap.delayedCall(0.5, () => {
                //     this.createNewBlocks();
                // })
            });
        }
    }

    private createGrid() {
        for (let row = 0; row < 8; row++) {
            let rowContainer = new Row(row);
            this.addChild(rowContainer);
            this.gridArrays.push((rowContainer.children as any).map((c: { type: any }) => c.type));
        }

        /**
         * GRID MASK
         */
        setTimeout(() => {
            // TODO - FIX THIS FUCKING SHIT!!!
            const mask = new Graphics();
            mask.beginFill(0xffffff, 1);
            mask.drawRect(
                this.globalBlocksPositions[0][0].x - this.blocks[0][0].width! * 2,
                this.globalBlocksPositions[0][0].y - this.blocks[0][0].height! / 2,
                this.width * + this.blocks[0][0].width! * 2,
                this.height + this.blocks[0][0].height!
            );
            mask.endFill();
            this.mask = mask;
            // this.checkPossibleMove(2, true);  
        }, 0);
    }

    private swapBlocks(block1_x: number, block1_y: number, dir: string) {
        this.dragging = false;
        this.swapDirection = dir;
        let item1 = this.blocks[block1_y][block1_x];
        let itemOneOldImg = item1.img;
        let itemTwoOldImg: Sprite | null = null;
        this.selectedBlock = { row: block1_y, col: block1_x, type: item1.type, oldX: item1.blockImg.x, oldY: item1.blockImg.y };
        let item2: any;
        switch (dir) {
            case "down":
                item2 = this.blocks[block1_y + 1][block1_x];
                this.blockBeingSwappedWith = { row: block1_y + 1, col: block1_x, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            case "up":
                item2 = this.blocks[block1_y - 1][block1_x];
                this.blockBeingSwappedWith = { row: block1_y - 1, col: block1_x, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            case "left":
                item2 = this.blocks[block1_y][block1_x - 1];
                this.blockBeingSwappedWith = { row: block1_y, col: block1_x - 1, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            case "right":
                item2 = this.blocks[block1_y][block1_x + 1];
                this.blockBeingSwappedWith = { row: block1_y, col: block1_x + 1, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            //------------
            case "leftUp":
                item2 = this.blocks[block1_y - 1][block1_x - 1];
                this.blockBeingSwappedWith = { row: block1_y - 1, col: block1_x - 1, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            case "rightUp":
                item2 = this.blocks[block1_y - 1][block1_x + 1];
                this.blockBeingSwappedWith = { row: block1_y - 1, col: block1_x + 1, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            case "leftDown":
                item2 = this.blocks[block1_y + 1][block1_x - 1];
                this.blockBeingSwappedWith = { row: block1_y + 1, col: block1_x - 1, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
            case "rightDown":
                item2 = this.blocks[block1_y + 1][block1_x + 1];
                this.blockBeingSwappedWith = { row: block1_y + 1, col: block1_x + 1, type: item2.type, oldX: item2.blockImg.x, oldY: item2.blockImg.y };
                break;
        }

        (itemTwoOldImg as any) = item2.img;

        gsap.to(item1.children[0], 0.5, {
            y: item2.children[0].y,
            x: item2.children[0].x,
            ease: "Back.easeInOut",
            onComplete: () => {

            }
        });

        gsap.to(item2.children[0], 0.5, {
            y: item1.children[0].y,
            x: item1.children[0].x,
            ease: "Back.easeInOut",
            onStart: () => {
                this.level.animationInProgress = true;
            },
            onComplete: () => {
                let type1 = item1.type;
                let gridPosition1 = item1.gridPosition;
                item1.type = item2.type;
                item1.gridPosition = item2.gridPosition;
                item2.type = type1;
                item2.gridPosition = gridPosition1;
                let matches: grid_interfaces.IMatches[] = this.checkGridForMatches();
                if (matches.length !== 0) {
                    console.log(matches);
                    // this.level.animationInProgress = true;
                    // if (this.hintTimeout) {
                    //     this.hintTimeout.kill();
                    // }
                    // clearInterval(this.hintInterval);//WTF
                    for (let m = 0; m < matches.length; m++) {
                        if (matches[m].row === item2.row && matches[m].col === item2.col) {
                            matches[m].beingSwapped = true;
                            this.matchingSwappedItem = 1;
                        } else if (((matches[m].row === item1.row) && (matches[m].col === item1.col))) {
                            matches[m].beingSwapped = true;
                            this.matchingSwappedItem = 2;
                        }
                        else {
                            matches[m].dir = this.swapDirection;
                        }
                    }

                    this.gridArrays[this.selectedBlock.row][this.selectedBlock.col] = itemTwoOldImg;
                    this.gridArrays[this.blockBeingSwappedWith.row][this.blockBeingSwappedWith.col] = itemOneOldImg;

                    let item_2_Old_X = this.globalBlocksPositions[this.selectedBlock.row][this.selectedBlock.col].x;
                    let item_2_Old_Y = this.globalBlocksPositions[this.selectedBlock.row][this.selectedBlock.col].y;
                    let item_2_OldType = this.blocks[this.selectedBlock.row][this.selectedBlock.col].type;

                    item2.children[0].x = this.globalBlocksPositions[this.blockBeingSwappedWith.row][this.blockBeingSwappedWith.col].x;
                    item2.children[0].y = this.globalBlocksPositions[this.blockBeingSwappedWith.row][this.blockBeingSwappedWith.col].y;
                    item2.type = this.blocks[this.blockBeingSwappedWith.row][this.blockBeingSwappedWith.col].type;

                    item2.children[0].texture = Texture.from(`${item2.type || item2.img}`);
                    item1.children[0].x = item_2_Old_X;
                    item1.children[0].y = item_2_Old_Y;
                    item1.type = item_2_OldType;
                    item1.children[0].texture = Texture.from(`${item1.type || item1.img}`);

                    gsap.delayedCall(0.35, () => {
                        this.addFilterToBlocks(matches);
                    })

                } else {
                    let type1 = item1.type;
                    item1.type = item2.type;
                    item2.type = type1;
                    gsap.to(item1.children[0], 0.2, {
                        y: this.selectedBlock.oldY,
                        x: this.selectedBlock.oldX,
                        ease: "Linear.easeNone",
                        onComplete: () => {
                            this.level.animationInProgress = false;
                        }
                    });
                    gsap.to(item2.children[0], 0.2, {
                        y: this.blockBeingSwappedWith.oldY,
                        x: this.blockBeingSwappedWith.oldX,
                        ease: "Linear.easeNone",
                        onComplete: () => {
                            this.level.animationInProgress = false;
                        }
                    });
                }
            }
        })
    }

    private checkGridForMatches(): grid_interfaces.IMatches[] {
        let matches: grid_interfaces.IMatches[] = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 6; col++) {
                let match = {
                    row: row,
                    col: col,
                    type: this.blocks[row][col].type,
                    beingSwapped: false,
                    dir: "",
                    id: -1
                };

                //              check right
                let thisBlock = this.blocks[row][col].type;
                let nextBlock_right1 = this.blocks[row][col + 1] ? this.blocks[row][col + 1].type : null;
                let nextBlock_right2 = this.blocks[row][col + 2] ? this.blocks[row][col + 2].type : null;
                let prevBlock_left1 = this.blocks[row][col - 1] ? this.blocks[row][col - 1].type : null;
                let prevBlock_left2 = this.blocks[row][col - 2] ? this.blocks[row][col - 2].type : null;

                //              check down
                let nextBlock_down1 = null;
                if (this.children[row + 1]) {
                    nextBlock_down1 = this.blocks[row + 1][col] ? this.blocks[row + 1][col].type : null;
                }

                let nextBlock_down2 = null;
                if (this.children[row + 2]) {
                    nextBlock_down2 = this.blocks[row + 2][col] ? this.blocks[row + 2][col].type : null;
                }

                let prevBlock_Up1 = null;
                if (this.children[row - 1]) {
                    prevBlock_Up1 = this.blocks[row - 1][col] ? this.blocks[row - 1][col].type : null;
                }
                let prevBlock_Up2 = null;
                if (this.children[row - 2]) {
                    prevBlock_Up2 = this.blocks[row - 2][col] ? this.blocks[row - 2][col].type : null;
                }

                if (
                    (thisBlock === prevBlock_Up1 && thisBlock === prevBlock_Up2) ||
                    (thisBlock === nextBlock_down1 && thisBlock === nextBlock_down2) ||
                    (thisBlock === nextBlock_down1 && thisBlock === prevBlock_Up1) ||
                    (thisBlock === nextBlock_right1 && thisBlock === nextBlock_right2) ||
                    (thisBlock === prevBlock_left1 && thisBlock === prevBlock_left2) ||
                    (thisBlock === nextBlock_right1 && thisBlock === prevBlock_left1)
                ) {
                    matches.push(match);
                }
                else {
                    //...
                }
            }
        }

        let tepmID = 0;
        let checkMatchId = (id: number, currentMatchIndex: number): boolean => {
            let suitableId = false;
            let _matches = matches.filter(m => m.type === matches[currentMatchIndex].type);
            _matches.forEach((match, index) => {
                if (
                    (matches[currentMatchIndex].row === _matches[index].row &&
                        matches[currentMatchIndex].col - _matches[index].col === 1 &&
                        matches[currentMatchIndex].type === _matches[index].type)
                    ||
                    (matches[currentMatchIndex].col === _matches[index].col &&
                        matches[currentMatchIndex].row - _matches[index].row === 1 &&
                        matches[currentMatchIndex].type === _matches[index].type)
                ) {
                    tepmID = _matches[index].id;
                    suitableId = true;
                }
            })
            return suitableId;
        };

        let id = 1;
        matches.forEach((match, index) => {
            if (index === 0) {
                match.id = 1;
            } else if (checkMatchId(id, index)) {
                match.id = tepmID;
            } else {
                id++;
                match.id = id;
            }
        })
        return matches;
    }

    private addFilterToBlocks(matches: grid_interfaces.IMatches[]): void {

        let colors: any = {
            "ball_red": "0xFF1D00",     // RED:
            "ball_blue": "0x3052FF",    // BLUE:
            "ball_green": "0x2F7F07",   // GREEN:
            "ball_yellow": "0xE2D841",  // YELLOW:
            "ball_purple": "0xB200FF"   // PURPLE:
        }

        matches.forEach((match, index) => {
            let currentBlock = (this.blocks as any)[match.row][match.col];
            let startScale = currentBlock.blockImg.scale.x;
            let isLast = index == matches.length - 1;
            gsap.to(currentBlock.blockImg.scale, 0.25, {
                // ease: "Back.easeIn",
                x: startScale * 1.1,
                y: startScale * 1.1,
                yoyo: true,
                repeat: 3,
                onStart: () => {
                    console.log(currentBlock.blockImg);
                    let filter = new GlowFilter({
                        distance: 5,// higher value is not working on mobile !!!!
                        outerStrength: 5,
                        innerStrength: 0,
                        color: colors[match.type],
                        quality: 1,
                        knockout: false,
                    })
                    currentBlock.blockImg.filters = [filter];
                },
                onComplete: () => {
                    currentBlock.blockImg.filters = [];
                    if (isLast) {
                        this.playMatchAnimations(matches);
                        this.increaseCardsPointsAfterMatch(matches);
                        matches.forEach((match, index) => {
                            let currentBlock = (this.blocks as any)[match.row][match.col];
                            currentBlock.blockImg.filters = [];
                        })

                    }
                    // currentBlock.blockImg.filters = [];
                }
            });
        });
    }

    //animate matching blocks to currently moved block position  
    private playMatchAnimations(matches: grid_interfaces.IMatches[]) {
        this.nullifyMatchesInGridArray(matches);

        matches.forEach(m => {
            let machingBlock = this.blocks[m.row][m.col];
            let startScale = machingBlock.blockImg.scale.x;
            let animData = {
                name: "match-animation",
                frames: 16,
                speed: 0.4,
                loop: false,
                paused: false,
                scale: 1.05
            }
            let frames = [];
            for (let frame = 1; frame <= animData.frames; frame++) {
                let current = `${animData.name}-${frame}`;
                frames.push(current);
            }

            let anim = new AnimatedSprite(frames.map((s) => Texture.from(s)));
            anim.width = this.width * 0.2;
            anim.scale.set(animData.scale);
            anim.x = machingBlock.blockImg.x - anim.width / 2;
            anim.y = machingBlock.blockImg.y - anim.height / 2;
            anim.animationSpeed = animData.speed;
            anim.loop = animData.loop;
            anim.play();
            anim.onComplete = () => {
                this.removeChild(anim)
            }
            this.addChildAt(anim, 0);

            gsap.to(machingBlock.blockImg, .4, {
                // delay: 0.2,
                alpha: 0,
            })
            gsap.fromTo(machingBlock.blockImg.scale, .4, {
                x: startScale * 1.1,
                y: startScale * 1.1,
                ease: "Linear.easeNone",
                onComplete: () => { }
            },
                {
                    x: startScale,
                    y: startScale,
                });
        });

        return;
        let beingSwapped = matches.filter(e => e.beingSwapped);
        const arrTypes = [...new Set(matches.map(m => m.id))];

        /* in this case this is automatch and we need to set target
            blocks for each match so that the rest of certain color can 
            go to target block position
        */

        // array of all matches types... for example ["ball_red", "ball_green"] etc.
        for (let _id of arrTypes) {
            if (beingSwapped.map(m => m.id).includes(_id)) { continue; }
            console.log(_id);
            let currentMatchItems = matches.filter(e => e.id === _id);
            let central = Math.floor(currentMatchItems.length / 2);
            let centralItem = matches.indexOf(matches.find(m => m === currentMatchItems[central])!);
            matches[centralItem].beingSwapped = true;   //?? might cause problems!!!!
            beingSwapped.push(matches[centralItem]);
        }

        for (let m = 0; m < beingSwapped.length; m++) {
            let thisColorMatchesIds = matches.filter(e => e.id === beingSwapped[m].id);
            for (let e = 0; e < thisColorMatchesIds.length; e++) {
                let targetBlock = thisColorMatchesIds.filter(x => x.beingSwapped)[0];
                let tweenTarget = this.blocks[thisColorMatchesIds[e].row][thisColorMatchesIds[e].col];

                if (!thisColorMatchesIds[e].beingSwapped) {
                    let newX = this.globalBlocksPositions[targetBlock.row][targetBlock.col].x;
                    let newY = this.globalBlocksPositions[targetBlock.row][targetBlock.col].y;
                    gsap.to(tweenTarget.blockImg, .2, {
                        x: newX,
                        y: newY,
                        alpha: 0,
                        ease: "Linear.easeNone",
                        onComplete: () => { }
                    });
                }
                else {
                    gsap.to(tweenTarget.blockImg, .2, {
                        alpha: 0,
                        delay: .2,
                        onComplete: () => { }
                    });
                }
            }
        }
    }

    private nullifyMatchesInGridArray(matches: grid_interfaces.IMatches[]) {
        for (const item of matches) {
            this.gridArrays[item.row][item.col] = null;
        }
    }

    private increaseCardsPointsAfterMatch(matches: grid_interfaces.IMatches[]) {

        let deck = App.isPlayerTurn ? "playerCards" : "opponentCards";
        this.checkForRedCard(matches, deck);
        this.checkForYellowCard(matches, deck);
        this.checkForInjury(matches, deck);

        for (let cardIdx = 0; cardIdx < (this.parent as any)[deck].children.length; cardIdx++) {
            let card = (this.parent as any)[deck].children[cardIdx];
            setTimeout(() => {
                card.increasePoints(matches);
            }, 75 * cardIdx);
        }
        gsap.delayedCall(0.75, () => {
            this.tweenDownMatchingBlocks(matches);
        })
    }

    private checkForRedCard(matches: grid_interfaces.IMatches[], deck: string) {
        let redCards = Math.floor(matches.map(m => m.type).filter(m => m === "red_card").length / 3);
        if (!redCards) { return };
        let redCardTargets = (this.parent as any)[deck].children.filter((player: Card) => !player.hasRedCard);
        for (let redCard = 0; redCard < redCards; redCard++) {

            //random target
            const targetIndex = Math.floor(Math.random() * redCardTargets.length);
            let redCardTarget = redCardTargets[targetIndex];

            let indexFound = false;
            if (App.pvpGame) {
                while (!indexFound) {
                    let randomIndex = App.randomIndexes[0];
                    App.randomIndexes.shift();
                    if (!(this.parent as any)[deck].children[randomIndex].hasRedCard) {
                        indexFound = true;
                        redCardTarget = (this.parent as any)[deck].children[randomIndex];
                    }
                }
            }

            //remove target
            redCardTargets.splice(targetIndex, 1);

            if (!redCardTarget) {
                // this means that this team can't continue
                // all are injured or have red cards
                this.stopGame();
                return;
            }

            redCardTarget.hasRedCard = true;
            redCardTarget.yellowCard.texture = Texture.from("red_card");
            redCardTarget.yellowCard.visible = true;
            this.bounceTarget(redCardTarget.yellowCard);
        }
    }

    private checkForYellowCard(matches: grid_interfaces.IMatches[], deck: string) {
        let yellowCards = Math.floor(matches.map(m => m.type).filter(m => m === "yellow_card").length / 3);
        if (!yellowCards) { return };
        //array of all players who do not have red cards and are not injured
        let yellowCardTargets = (this.parent as any)[deck].children.filter((player: Card) => !player.hasRedCard && !player.hasInjury);
        for (let yellowCard = 0; yellowCard < yellowCards; yellowCard++) {

            //random target
            let yellowCardTarget = yellowCardTargets[Math.floor(Math.random() * yellowCardTargets.length)];

            let indexFound = false;
            if (App.pvpGame) {
                while (!indexFound) {
                    let randomIndex = App.randomIndexes[0];
                    App.randomIndexes.shift();
                    let target = (this.parent as any)[deck].children[randomIndex];
                    if (!target.hasRedCard && !target.hasInjury) {
                        indexFound = true;
                        yellowCardTarget = target;
                    }
                }
            }

            if (yellowCardTarget.hasYellowCard) {
                yellowCardTarget.hasRedCard = true;
                yellowCardTarget.yellowCard.texture = Texture.from("red_card");
            }
            yellowCardTarget.hasYellowCard = true;
            yellowCardTarget.yellowCard.visible = true;
            this.bounceTarget(yellowCardTarget.yellowCard);
        }
    }

    private checkForInjury(matches: grid_interfaces.IMatches[], deck: string) {
        let injuries = Math.floor(matches.map(m => m.type).filter(m => m === "red_cross").length / 3);
        if (!injuries) { return };
        //array of all players who do not have red cards and are not injured
        let injuryTargets = (this.parent as any)[deck].children.filter((player: Card) => !player.hasInjury && !player.hasRedCard);
        for (let injury = 0; injury < injuries; injury++) {

            //random target
            const targetIndex = Math.floor(Math.random() * injuryTargets.length);
            let injuryTarget = injuryTargets[targetIndex];

            let indexFound = false;
            if (App.pvpGame) {
                while (!indexFound) {
                    let randomIndex = App.randomIndexes[0];
                    App.randomIndexes.shift();
                    let target = (this.parent as any)[deck].children[randomIndex]
                    if (!target.hasRedCard && !target.hasInjury) {
                        indexFound = true;
                        injuryTarget = target;
                    }
                }
            }

            //remove target
            injuryTargets.splice(targetIndex, 1);

            if (!injuryTarget) {
                // this means that this team can't continue
                // all are injured or have red cards
                this.stopGame();
                return;
            }

            injuryTarget.hasInjury = true;
            injuryTarget.injury.visible = true;
            this.bounceTarget(injuryTarget.injury);
        }
    }

    private stopGame() {
        // TODO - handle this situation...
        alert("one of the teams can't continue dut to lack of players!");
    }

    private bounceTarget(target: Sprite) {
        let scaleValue = target.scale.x;
        target.alpha = 1;
        gsap.to(target.scale, .3, {
            x: scaleValue * 1.25,
            y: scaleValue * 1.25
        });
        gsap.to(target.scale, .3, {
            delay: 0.3,
            x: scaleValue,
            y: scaleValue,
            alpha: 0.75
        });
        gsap.to(target, .3, {
            delay: 0.3,
            alpha: 0.85
        });
    }

    // check for automatic matches on the grid after manual match - after random blocks arrived
    private checkAutomaticMatch() {
        gsap.delayedCall(0.35, () => {
            let matches = this.checkGridForMatches();
            if (matches.length > 0) {
                this.addFilterToBlocks(matches);
            } else {
                if (App.specialInProgress) {
                    this.checkGoalAttemps();
                    return;
                }
                this.checkPossibleMove();
            }
        })
    }

    // try to find possible match for move..TODO.. if non are found reshufle!
    public checkPossibleMove(delay = 0, newlyCreatedGrid = false) {

        console.log(`newlyCreatedGrid => ${newlyCreatedGrid}`);

        let possibleMoves: grid_interfaces.IPossibleMoves[] = [];
        this.nextRoundDelay = delay;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 6; col++) {

                //         check left-up
                if (col > 0 && row > 0) {
                    let tempType = this.blocks[row][col].type;
                    this.blocks[row][col].type = this.blocks[row - 1][col - 1].type;
                    this.blocks[row - 1][col - 1].type = tempType;
                    let matches = this.checkGridForMatches();

                    if (matches.length > 0) {

                        let colors: any = {};
                        matches.forEach(m => {
                            if (colors[m.type] !== undefined) {
                                colors[m.type]++
                            }
                            else {
                                colors[m.type] = 1;
                            }
                        });

                        possibleMoves.push(
                            {
                                col: col,
                                row: row,
                                dir: "leftUp",
                                matches: matches.length,
                                types: Array.from(new Set(matches.map(m => m.type))),
                                colors: colors
                            }
                        );
                    }
                    this.blocks[row - 1][col - 1].type = this.blocks[row][col].type;
                    this.blocks[row][col].type = tempType;
                }

                //         check right-up
                if (col < 5 && row > 0) {
                    let tempType = this.blocks[row][col].type;
                    this.blocks[row][col].type = this.blocks[row - 1][col + 1].type;
                    this.blocks[row - 1][col + 1].type = tempType;
                    let matches = this.checkGridForMatches();
                    if (matches.length > 0) {
                        let colors: any = {};
                        matches.forEach(m => {
                            if (colors[m.type] !== undefined) {
                                colors[m.type]++
                            }
                            else {
                                colors[m.type] = 1;
                            }
                        });
                        possibleMoves.push(
                            {
                                col: col,
                                row: row,
                                dir: "rightUp",
                                matches: matches.length,
                                types: Array.from(new Set(matches.map(m => m.type))),
                                colors: colors
                            }
                        );
                    }
                    this.blocks[row - 1][col + 1].type = this.blocks[row][col].type;
                    this.blocks[row][col].type = tempType;
                }

                //         check right
                if (col < 5) {
                    let tempType = this.blocks[row][col].type;
                    this.blocks[row][col].type = this.blocks[row][col + 1].type;
                    this.blocks[row][col + 1].type = tempType;
                    let matches = this.checkGridForMatches();
                    if (matches.length > 0) {
                        let colors: any = {};
                        matches.forEach(m => {
                            if (colors[m.type] !== undefined) {
                                colors[m.type]++
                            }
                            else {
                                colors[m.type] = 1;
                            }
                        });
                        possibleMoves.push(
                            {
                                col: col,
                                row: row,
                                dir: "right",
                                matches: matches.length,
                                types: Array.from(new Set(matches.map(m => m.type))),
                                colors: colors
                            }
                        );
                    }
                    this.blocks[row][col + 1].type = this.blocks[row][col].type;
                    this.blocks[row][col].type = tempType;
                }

                //         //check down
                if (row < 7) {
                    let tempType = this.blocks[row][col].type;
                    this.blocks[row][col].type = this.blocks[row + 1][col].type;
                    this.blocks[row + 1][col].type = tempType;
                    let matches = this.checkGridForMatches();
                    if (matches.length > 0) {
                        let colors: any = {};
                        matches.forEach(m => {
                            if (colors[m.type] !== undefined) {
                                colors[m.type]++
                            }
                            else {
                                colors[m.type] = 1;
                            }
                        });
                        possibleMoves.push(
                            {
                                col: col,
                                row: row,
                                dir: "down",
                                matches: matches.length,
                                types: Array.from(new Set(matches.map(m => m.type))),
                                colors: colors
                            }
                        );
                    }
                    this.blocks[row + 1][col].type = this.blocks[row][col].type;
                    this.blocks[row][col].type = tempType;
                }
            }
        }

        // these 3 ifs aim remove potentioal opponent dummy moves like matching red/yellow cards and injuries
        if (possibleMoves.length !== 1) {
            if (possibleMoves.filter(ps => ps.types.includes("red_card")).length === possibleMoves.length) {
                let randomIndex = Math.floor(Math.random() * possibleMoves.length) + 1;
                possibleMoves = possibleMoves.slice(randomIndex - 1, randomIndex);
            } else {
                possibleMoves = possibleMoves.filter(ps => !ps.types.includes("red_card"));
            }
        }
        if (possibleMoves.length !== 1) {
            if (possibleMoves.filter(ps => ps.types.includes("red_cross")).length === possibleMoves.length) {
                let randomIndex = Math.floor(Math.random() * possibleMoves.length) + 1;
                possibleMoves = possibleMoves.slice(randomIndex - 1, randomIndex);
            } else {
                possibleMoves = possibleMoves.filter(ps => !ps.types.includes("red_cross"));
            }
        }
        if (possibleMoves.length !== 1) {
            if (possibleMoves.filter(ps => ps.types.includes("yellow_card")).length === possibleMoves.length) {
                let randomIndex = Math.floor(Math.random() * possibleMoves.length) + 1;
                possibleMoves = possibleMoves.slice(randomIndex - 1, randomIndex);
            } else {
                possibleMoves = possibleMoves.filter(ps => !ps.types.includes("yellow_card"));
            }
        }

        this.hintMatch = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        this.bestPossibleMove = smartMove(possibleMoves);

        // this.noMoves =true// possibleMoves.length === 0; // test...
        this.noMoves = possibleMoves.length === 0;
        console.log(`possible moves => ${JSON.stringify(possibleMoves)}`);
        if (!newlyCreatedGrid) {
            setTimeout(() => {
                this.checkGoalAttemps();
            }, 1.2);
        } else {
            setTimeout(() => {
                if (!App.isPlayerTurn && this.level.currentRound === 0) {
                    gsap.delayedCall(2 + this.nextRoundDelay, () => {
                        this.proceedToNextRound();
                    })
                }
            }, 1);
        }
    }

    private createNoMovesPopup() {
        this.popup = new NoMovesPopup();
        setTimeout(() => {
            this.parent.addChild(this.popup);
            gsap.delayedCall(2, () => {
                this.parent.removeChild(this.popup);
                gsap.delayedCall(5, () => {
                    // TODO - HANDLE PVP GAME !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    if (!this.noMoves && (!App.isPlayerTurn || this.level.autoplayMode)) {

                        this.proceedToNextRound();
                    }
                })
            })
        }, 1);
        this.reShufleGrid();
    }

    private checkGoalAttemps() {
        if (this.level.goalAttempts.length > 0) {
            this.goalAttempt();
        }
        else if (this.noMoves) {
            if (!App.specialInProgress) {
                App.isPlayerTurn = !App.isPlayerTurn;
            }
            this.createNoMovesPopup();
        }
        else {

            if (App.specialInProgress) {
                App.specialInProgress = false;
                return;
            }
            App.specialInProgress = false;
            App.isPlayerTurn = !App.isPlayerTurn;
            setTimeout(() => {
                this.newRound();
            }, 1);
            const nextRoundDelay = App.isPlayerTurn ? 0 : 3
            gsap.delayedCall(nextRoundDelay + this.nextRoundDelay, () => {
                App.specialInProgress = false;
                this.proceedToNextRound();
            })
        }
    }

    private goalAttempt() {
        //repeat this for all goal attempts !!!!!!!

        let tweenTarget = this.level.goalAttempts[0];
        let attackColor = tweenTarget.color;

        let newX = App.width / 2;
        let newY = App.isPlayerTurn ? App.height * 0.7 : App.height * 0.3;
        let scaleValue = tweenTarget.scale.x;

        gsap.to(tweenTarget, 1, {
            x: newX,
            y: newY,
            onComplete: () => { }
        });
        gsap.to(tweenTarget.scale, 1, {
            x: scaleValue * 5,
            y: scaleValue * 5,
            onComplete: () => { }
        });

        let firstActiveDefenseFound: ActiveDefense | null = null;
        if (App.isPlayerTurn) {
            firstActiveDefenseFound = this.level.opponentActiveDefenses
                .filter((activeDefense: ActiveDefense) => activeDefense !== null && activeDefense.color === attackColor)[0];

            console.log(firstActiveDefenseFound)
        } else {
            firstActiveDefenseFound = this.level.playerActiveDefenses
                .filter((activeDefense: ActiveDefense) => activeDefense !== null && activeDefense.color === attackColor)[0];
        }

        if (!firstActiveDefenseFound) {
            //GOAL SCORED!!!
            this.hasGoalsInThisRound = true;
            if (App.isPlayerTurn) {
                this.level.playerCards.children[tweenTarget.initiatorIndex].goalsScored++;
            }
            let finalY = App.isPlayerTurn ? App.height * 0.12 : App.height * 0.88
            gsap.to(tweenTarget, .5, {
                delay: 1.1,
                y: finalY,
                alpha: 0,
                onComplete: () => {
                    App.isPlayerTurn ? this.level.playerScore++ : this.level.opponentScore++;
                    tweenTarget.parent.removeChild(tweenTarget);
                    this.showText("GOAL!");
                }
            });
            gsap.to(tweenTarget.scale, .5, {
                delay: 1.1,
                x: scaleValue,
                y: scaleValue,
                onComplete: () => { }
            });
        } else {
            let newX = App.width / 2;
            let newY = App.isPlayerTurn ? App.height * 0.3 : App.height * 0.7;
            let scaleValue = (firstActiveDefenseFound as any).scale.x;
            gsap.to(firstActiveDefenseFound, 1.1, {
                x: newX,
                y: newY,
                onComplete: () => { }
            });
            gsap.to((firstActiveDefenseFound as any).scale, 1.1, {
                x: scaleValue * 5,
                y: scaleValue * 5,
                onComplete: () => { }
            });
            gsap.to(tweenTarget, .25, {
                delay: 1.1,
                y: App.height / 2,
                alpha: 0,
                onComplete: () => {
                    tweenTarget.parent.removeChild(tweenTarget);
                }
            });
            gsap.to(firstActiveDefenseFound, .25, {
                delay: 1.1,
                y: App.height / 2,
                alpha: 0,
                onComplete: () => {
                    if (App.isPlayerTurn) {
                        this.level.opponentActiveDefenses[(firstActiveDefenseFound as any).index] = null;
                    } else {
                        this.level.playerActiveDefenses[(firstActiveDefenseFound as any).index] = null;
                    }
                    (firstActiveDefenseFound as any).parent.removeChild((firstActiveDefenseFound as any));
                    this.showText("SAVED");
                }
            });
        }
    }

    private showText(text: string) {
        this.goalText = new Text(text, {
            fontFamily: config.mainFont,
            fontSize: App.height / 6,
            fill: '#000000',
            align: 'center',
            stroke: '#dbb7b7',
            fontWeight: "800",
            strokeThickness: 6
        });
        this.goalText.position.set(App.width / 2, App.height / 2);
        this.goalText.anchor.set(0.5, 0.5);
        this.addChild(this.goalText);

        gsap.to(this.goalText, .05, { x: "+=3", yoyo: true, repeat: 10 });
        gsap.to(this.goalText, .05, {
            x: "-=3",
            yoyo: true,
            repeat: 10,
            onComplete: () => {
                gsap.delayedCall(1.2, () => {
                    this.removeChild(this.goalText);
                    this.level.goalAttempts.shift();
                    this.checkGoalAttemps();
                })
            }
        });
    }

    public proceedToNextRound() {
        if (App.pvpGame) return;
        this.level.goalAttempts = [];
        const delay = this.level.autoplayMode ? 1 : 0;

        if ((!App.isPlayerTurn || this.level.autoplayMode) && !App.pvpGame) {
            gsap.delayedCall(delay, () => {
                this.swapBlocks(this.bestPossibleMove.col, this.bestPossibleMove.row, this.bestPossibleMove.dir);
            })
        }
    }

    public PvP_moveData_received(moveData: any) {
        this.level.goalAttempts = [];
        // gsap.delayedCall(0.5, () => {
        this.swapBlocks(moveData.col, moveData.row, moveData.dir);
        // })
    }

    public newRound() {

        if (this.level.currentRound === 0) {
            this.level.addAdditionalChildren();
        }

        let defaultRoundToShowPopup = [0, 5, 10, 15].includes(this.level.currentRound);

        if (
            (
                App.isPlayerTurn && this.level.isPlayerHome ||
                !App.isPlayerTurn && !this.level.isPlayerHome
            )
        ) {
            this.level.currentRound++;
        }

        let matchFinished = this.level.currentRound > config.roundsInMatch;
        let lastRound = this.level.currentRound === config.roundsInMatch;

        if (
            this.hasGoalsInThisRound || matchFinished || defaultRoundToShowPopup || lastRound
        ) {
            this.popup = new NewRoundPopup(matchFinished, lastRound);
            this.parent.addChild(this.popup);
        }
        // else {
        this.level.animationInProgress = !App.isPlayerTurn;
        // }

        const spinningBall_y = App.isPlayerTurn ? 0.85 : 0.15;
        gsap.to(this.level.spinningBall, .35, {
            y: App.height * spinningBall_y
        });
        if (App.isPlayerTurn) {
            this.addHint();
        }
    }

    private addHint() {
        this.hintTimeout = gsap.delayedCall(5, () => {
            let start = () => {
                this.hintInterval = gsap.delayedCall(0.6, () => {
                    let target1 = this.blocks[this.hintMatch.row][this.hintMatch.col];
                    let target2;
                    if (this.hintMatch.dir === "right") {
                        target2 = this.blocks[this.hintMatch.row][this.hintMatch.col + 1];
                    }
                    else if (this.hintMatch.dir === "down") {
                        target2 = this.blocks[this.hintMatch.row + 1][this.hintMatch.col];
                    }
                    else if (this.hintMatch.dir === "leftUp") {
                        target2 = this.blocks[this.hintMatch.row - 1][this.hintMatch.col - 1];
                    }
                    else {// rightUp
                        target2 = this.blocks[this.hintMatch.row - 1][this.hintMatch.col + 1];
                    }

                    let width1 = target1.width! * 1.05;
                    let height1 = target1.height! * 1.05;
                    let width2 = target2.width! * 1.05;
                    let height2 = target2.height! * 1.05;

                    this.hintTween1 = gsap.to(target1.blockImg, 0.3, {
                        width: width1,
                        height: height1,
                        yoyo: true,
                        repeat: 1
                    });
                    this.hintTween2 = gsap.to(target2.blockImg, 0.3, {
                        width: width2,
                        height: height2,
                        yoyo: true,
                        repeat: 1
                    });
                    if (!this.level.animationInProgress && !App.specialInProgress) {
                        start();
                    }
                });
            }
            start();
        })
    }

    private reShufleGrid() {
        this.removeChildren();
        this.blocks = [[], [], [], [], [], [], [], []];
        this.gridArrays = [];

        gsap.delayedCall(1.5, () => {
            this.createGrid();
        })
    }

    private tweenDownMatchingBlocks(matches: grid_interfaces.IMatches[]) {

        // make remaining blocks fall first!
        this.holesInColumns = [
            { holes: 0, onRow: [] },
            { holes: 0, onRow: [] },
            { holes: 0, onRow: [] },
            { holes: 0, onRow: [] },
            { holes: 0, onRow: [] },
            { holes: 0, onRow: [] }
        ];

        /*
            loop thru grid array to find number
            of holes and their row positions
        */
        this.gridArrays.forEach((row, rowIndex: number | never) => {
            row.forEach((col, colIndex) => {
                if (this.gridArrays[rowIndex][colIndex] === null) {
                    this.holesInColumns[colIndex].holes++;
                    this.holesInColumns[colIndex].onRow.push(rowIndex);
                }
            });
        });

        /*
            loop thru blocks to determine
            how many rows each block should fall
        */

        this.fallingBlocksOnColumn = [
            0,
            0,
            0,
            0,
            0,
            0
        ]

        this.blocks.forEach((row, rowIndex) => {
            row.forEach((el: any, colIndex: number) => {
                this.blocks[rowIndex][colIndex].shouldFall = 0;
                if (this.gridArrays[rowIndex][colIndex] !== null) {
                    this.blocks[rowIndex][colIndex].shouldFall = this.holesInColumns[colIndex].onRow.filter(h => h >= el.row).length;
                }
                let shouldFall = this.blocks[rowIndex][colIndex].shouldFall;
                if (shouldFall! > 0) {

                    this.fallingBlocksOnColumn[colIndex]++;
                    let lastHoleInColumn = this.holesInColumns[colIndex].onRow.slice(-1);

                    let previousColumnsWithFallingBlocks = this.fallingBlocksOnColumn.slice(0, colIndex).filter((c: number) => c !== 0).length;

                    let substractImovableBlocks = 7 - lastHoleInColumn[0];

                    let newY = this.globalBlocksPositions[rowIndex + shouldFall!][colIndex].y;
                    let tweenTarget: any = this.blocks[rowIndex][colIndex].blockImg;

                    let delay = (
                        8 -
                        substractImovableBlocks -
                        this.holesInColumns[colIndex].holes -
                        this.fallingBlocksOnColumn[colIndex] +
                        previousColumnsWithFallingBlocks
                    )
                        * this.delayStep;

                    console.log(` old blocks falling delay =>`, delay);


                    gsap.to(tweenTarget, 0.25, {
                        y: newY,
                        delay: delay,
                        ease: "Back.easeInOut",
                        onComplete: () => {
                            // gsap.globalTimeline.clear();
                            this.gridArrays[rowIndex + shouldFall!][colIndex] = tweenTarget.parent.type;
                        }
                    });
                }
            });
        });
        if (!App.pvpGame || (App.pvpGame && App.isPlayerTurn)) {
            this.createNewBlocks();
        }
        else if (App.pvpGame && !App.isPlayerTurn) {

            if (this.PvP_newBlocks.length > 0) {
                this.createNewBlocks();
            }
            else {
                App.EE.once("new_blocks_received", (newBlocks) => {
                    this.PvP_newBlocks = newBlocks;
                    this.createNewBlocks();
                });
            }
        }
        else {
            gsap.delayedCall(0.05, () => {
                this.createNewBlocks();
            })
        }
    }

    private createNewBlocks() {
        let blockHeight = this.globalBlocksPositions[1][0].y - this.globalBlocksPositions[0][0].y;
        let gridY = this.globalBlocksPositions[0][0].y;
        let newBlocks: string[] = [];

        // let totalDelay = 0;

        console.log(this.fallingBlocksOnColumn);


        let longestDelay = 0;
        this.holesInColumns.forEach((el, colIndex) => {

            let delay = 0;

            if (el.holes > 0) {
                // totalDelay += this.delayStep;
                for (let hole = 0; hole < el.holes; hole++) {

                    let row = el.onRow[hole];
                    let block = this.blocks[row][colIndex].blockImg;
                    let img = "";
                    if (App.pvpGame && !App.isPlayerTurn) {
                        img = this.PvP_newBlocks[0];
                        this.PvP_newBlocks.shift();
                    } else {
                        img = (block.parent as any).generateRandomColorBlock();
                    }

                    newBlocks.push(img);
                    block.texture = Texture.from(`${img}`);
                    let startY = this.globalBlocksPositions[el.holes - hole - 1][colIndex].y;
                    block.y = gridY - (blockHeight * (hole + 1));
                    block.x = this.globalBlocksPositions[row][colIndex].x;
                    block.alpha = 1;


                    let previousColumnsWithFallingBlocks = this.fallingBlocksOnColumn.slice(0, colIndex).filter((c: number) => c !== 0).length;
                    delay = (this.fallingBlocksOnColumn[colIndex] + previousColumnsWithFallingBlocks) * this.delayStep;

                    if (delay + this.fallTweenDuration > longestDelay) {
                        longestDelay = delay + this.fallTweenDuration + 0.01;
                    }

                    this.fallingBlocksOnColumn[colIndex]++;

                    gsap.to(block, this.fallTweenDuration, {
                        delay: delay,
                        y: startY,
                        ease: "Back.easeOut",
                        onComplete: () => {
                            console.log(`fallTweenComplete`);
                            // gsap.globalTimeline.clear();
                            (this.gridArrays as any)[el.holes - hole - 1][colIndex] = (block.parent as any).img = img;
                        }
                    });
                }
            }
        });

        if (App.pvpGame && App.isPlayerTurn) {
            WSConnection.newBlocks(newBlocks);
        }

        newBlocks = [];

        gsap.delayedCall(longestDelay, () => {
            console.log(`longestDelay DONE!!!!`);

            this.setAccurateBlocksPositions();
        })
    }

    private setAccurateBlocksPositions() {
        this.gridArrays.forEach((row, rowIndex) => {
            row.forEach((el, colIndex) => {
                let img = this.gridArrays[rowIndex][colIndex];
                let type = img;
                let texture = Texture.from(`${img}`);
                let x = this.globalBlocksPositions[rowIndex][colIndex].x;
                let y = this.globalBlocksPositions[rowIndex][colIndex].y;

                this.blocks[rowIndex][colIndex].img = img;
                this.blocks[rowIndex][colIndex].type = type;
                this.blocks[rowIndex][colIndex].blockImg.texture = texture;
                this.blocks[rowIndex][colIndex].blockImg.x = x;
                this.blocks[rowIndex][colIndex].blockImg.y = y;
            })
        })
        this.checkAutomaticMatch();
    }

    public onDragStart = (e: InteractionEvent) => {
        this.moveCoordinates.startX = e.data.global.x;
        this.moveCoordinates.startY = e.data.global.y;
        this.moveCoordinates.lastX = e.data.global.x;
        this.moveCoordinates.lastY = e.data.global.y;

        this.gridPosition_x = (e as any).gridPosition_x;
        this.gridPosition_y = (e as any).gridPosition_y;
        this.data = e.data;
        this.dragging = true;
    }

    public onDragMove = (e: InteractionEvent) => {
        // console.log(e);

        if (this.dragging && !this.level.animationInProgress && !App.specialInProgress) {
            /**
             *  gets block height and divides it by 3,
             *  the least drag/swipe distance
             *  to start blocks swap.
             *  ...needs better solution here!!!
             */
            this.moveCoordinates.lastX = e.data.global.x;
            this.moveCoordinates.lastY = e.data.global.y;

            let dist = this.blocks[0][0].height! / 1.5;

            let directions: grid_interfaces.IDirections = {
                left: this.moveCoordinates.startX - this.moveCoordinates.lastX,
                right: this.moveCoordinates.lastX - this.moveCoordinates.startX,
                up: this.moveCoordinates.startY - this.moveCoordinates.lastY,
                down: this.moveCoordinates.lastY - this.moveCoordinates.startY,
                leftUp: (this.moveCoordinates.startX -
                    this.moveCoordinates.lastX +
                    this.moveCoordinates.startY -
                    this.moveCoordinates.lastY) / 1.5,
                rightUp: (this.moveCoordinates.lastX -
                    this.moveCoordinates.startX +
                    this.moveCoordinates.startY -
                    this.moveCoordinates.lastY) / 1.5,
                leftDown: (this.moveCoordinates.startX -
                    this.moveCoordinates.lastX +
                    this.moveCoordinates.lastY -
                    this.moveCoordinates.startY) / 1.5,
                rightDown: (this.moveCoordinates.lastX -
                    this.moveCoordinates.startX +
                    this.moveCoordinates.lastY -
                    this.moveCoordinates.startY) / 1.5
            };

            let arr = Object.values(directions);
            let max = Math.max(...arr);

            let dir = Object.keys(directions).find(key => directions[key as keyof grid_interfaces.IDirections] === max);
            if (
                (this.moveCoordinates.startY === this.moveCoordinates.lastY && this.moveCoordinates.startX === this.moveCoordinates.lastX) ||
                (dir === "down" && this.gridPosition_y === 7) ||
                (dir === "up" && this.gridPosition_y === 0) ||
                (dir === "right" && this.gridPosition_x === 5) ||
                (dir === "left" && this.gridPosition_x === 0) ||
                (dir === "leftUp" && this.gridPosition_y === 0 && this.gridPosition_x === 0) ||
                (dir === "rightUp" && this.gridPosition_y === 0 && this.gridPosition_x === 5) ||
                (dir === "leftDown" && this.gridPosition_y === 7 && this.gridPosition_x === 0) ||
                (dir === "rightDown" && this.gridPosition_y === 7 && this.gridPosition_x === 5) ||
                max < dist
            ) {
                return;
            }
            if (App.pvpGame) {
                //here we send move data to the other player
                const moveData = {
                    col: this.gridPosition_x,
                    row: this.gridPosition_y,
                    dir: dir
                }
                WSConnection.blocksMatched(moveData);
            }
            this.swapBlocks(this.gridPosition_x, this.gridPosition_y, dir!);
        }
    }

    public onDragEnd(e: InteractionEvent) {
        this.dragging = false;
    }
}
