import { App, IScene, IPlayerLineUp } from "../App";
import { RotatingButton } from "../buttons/RotatingButton";
import { recordClubPlayersParams } from "../recordClubPlayersParams";
import gsap from "gsap";
import { Container, Graphics, Sprite, Text, TextStyle, CanvasResource, utils } from "pixi.js";
import { config } from "../configs/MainGameConfig";
import { Card } from "../game_level/Card";
import { createText } from "../createText";
import { GlowFilter } from "pixi-filters";

export class EditTeam extends Container implements IScene {
    private backgroundImg: Sprite;
    private container: Container;
    private bg: Graphics;
    private clubName: string;
    private players: IPlayerLineUp[];
    private stageWidth: number;
    private stageHeight: number;
    private text: Text;
    private allCards: Card[] = [];
    private saveBtn: RotatingButton;
    private backBtn: RotatingButton;

    constructor() {
        super();
        this.container = new Container;

        //BG
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0);
        this.bg.drawRect(
            0,
            0,
            App.width,
            App.height
        );
        this.bg.endFill();
        this.container.addChild(this.bg);
        this.bg.interactive = true;
        this.bg.on('pointerdown', () => { });
        this.clubName = App.playerClubData.name;

        this.players = App.playerLineUp.slice();
        this.stageWidth = App.width;
        this.stageHeight = App.height;
        this.addBG();
        this.createHeader();
        this.createPlayers();
        this.addButtons();
        this.checkSaveAllowed();
        this.addChild(this.container);
    }

    public update(time: number): void { }

    public addBG(): void {
        this.backgroundImg = Sprite.from("bg55");
        this.backgroundImg.interactive = true;
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);
    }

    private createHeader() {
        this.text = new Text('Edit Your Team', {
            fontFamily: config.mainFont,
            fontSize: App.height / 30,
            fill: '#ffffff',
            align: 'center'
        });
        this.text.position.set(App.width / 2, App.height * 0.03);
        this.text.anchor.set(0.5, 0.5);
        this.container.addChild(this.text);
    }

    private createPlayers() {
        let Y_positions: IY_positions = {
            starting: App.height * 0.83,
            F: App.height * 0.64,
            MD: App.height * 0.45,
            DF: App.height * 0.26,
            GK: App.height * 0.07
        }

        let playersCount: IPlayersCount = {
            starting: 0,
            GK: 0,
            DF: 0,
            MD: 0,
            F: 0
        }
        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fill: "#ffffff",
                align: 'center'
            });
        }

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            const playerPosition = player.position;
            const isSub = player.substitute;
            let card_x = isSub ? (App.width / 6) * playersCount[playerPosition as keyof IPlayersCount] : (App.width / 6) * playersCount.starting;
            let card_y = isSub ? Y_positions[playerPosition as keyof IPlayersCount] : Y_positions.starting;
            let card_width = App.width / 6;
            let card_height = App.height * 0.12;

            let card = new Card({
                index: i,
                stats: player,
                font_size: this.stageHeight / 45,// + 'px',  //change this shit!!

                cardTexture: `${player.player_img_id}`,
                card_x: card_x,
                card_y: card_y,
                card_width: card_width,
                card_height: card_height,

                shoeTexture: `shoe`,
                shoe_x: card_x,
                shoe_y: card_y + card_height * 0.02,
                shoe_height: card_height * 0.23,

                attack_text: {
                    x: card_x + card_width,
                    y: card_y
                },

                gloveTexture: `glove2`,
                glove_x: card_x,
                glove_y: card_y + card_height * 0.7,
                glove_height: card_width * 0.35,

                defense_text: {
                    x: card_x + card_width,
                    y: card_y + card_height * 0.76
                },

                yellowCardTexture: `yellow_card`,
                yellowCard_x: card_x + card_width / 2,
                yellowCard_y: card_y + card_height / 2,
                yellowCard_width: card_width * 0.75,

                injuryTexture: `red_cross`,
                injury_x: card_x + card_width / 2,
                injury_y: card_y + card_height / 2,
                injury_width: card_width * 0.75,

                starsTexture: `star`,
                stars_x: card_x + card_width / 2,
                stars_y: card_y,
                stars_width: card_width * 0.12,

                totalPower: player.defense_full + player.attack_full

            }, false, false);

            this.container.addChild(card);
            this.allCards.push(card);
            card.playerPosition = playerPosition;
            card.isSub = isSub;

            let goals = createText(`${player.goalsScored}`, getStyle(), card, card_y + card_height * 1.035, card_x + card_width * 0.4, 1, 0, App.height / 75);
            card.addGoalsScored(goals.x - goals.width);
            createText(`exp ${player.EXP}`, getStyle(), card, card_y + card_height * 1.05, card_x + card_width * 0.55, 0, 0, App.height / 90);

            createText(`${player.leagueYellowCards}`, getStyle(), card, card_y + card_height * 1.2, card_x + card_width * 0.5, 0, 0, App.height / 75);
            card.addLeagueCardsAndInjury(player.leagueYellowCards, player.leagueRedCards, player.injured);
            isSub ? playersCount[playerPosition as keyof IPlayersCount]++ : playersCount.starting++;
        }

        this.makeInteractive();

        createText('goalkeepers', getStyle(), this.container, App.height * 0.05, 0, 0, 0.5, App.height / 45);
        createText('defenders', getStyle(), this.container, App.height * 0.24, 0, 0, 0.5, App.height / 45);
        createText('midfielders', getStyle(), this.container, App.height * 0.43, 0, 0, 0.5, App.height / 45);
        createText('forwards', getStyle(), this.container, App.height * 0.62, 0, 0, 0.5, App.height / 45);
        createText('starting line-up', getStyle(), this.container, App.height * 0.81, 0, 0, 0.5, App.height / 45);
    }

    private makeInteractive() {

        this.allCards.forEach((child, childIdx) => {
            if (child.selectable) {
                child.interactive = true;
                child.selected = false;
                child.on('pointerdown', (e) => {
                    // const isSub = this.checkIfSubstitute(childIdx);

                    const selectedPlayerFound = this.allCards.filter(pl => pl.selected).length > 0;
                    const samePlayerSelected = child.selected;
                    const successfulSubstitution = !samePlayerSelected && selectedPlayerFound;

                    if (successfulSubstitution) {
                        this.switchCardsonSuccessfulSubstitution(this.allCards.filter(pl => pl.selected)[0], child);
                    } else {
                        let filter = new GlowFilter({
                            distance: 17,// higher value is not working on mobile !!!!
                            outerStrength: 5,
                            innerStrength: 0,
                            color: 0x4af74a,
                            quality: 1,
                            knockout: false,
                        })
                        child.cardImg.filters = [filter];
                    }

                    this.allCards.forEach((card, cardIdx) => {
                        if (successfulSubstitution) {
                            card.cardImg.filters = [];
                            card.alpha = 1;
                            card.interactive = true;
                            card.selected = false;
                        }
                        else if ((card.playerPosition === child.playerPosition) || samePlayerSelected) {
                            card.alpha = 1;
                            card.interactive = true;

                        } else {
                            card.alpha = 0.35;
                            card.selected = false;
                            card.interactive = false;
                        }

                        if (samePlayerSelected) {
                            card.cardImg.filters = [];
                        }

                        child.alpha = 1;
                    })
                    if (samePlayerSelected || successfulSubstitution) {
                        child.selected = false;
                        // child.cardImg.filter = [];
                    } else {
                        child.selected = true;
                    }
                    child.interactive = true;
                    // alert(JSON.stringify(child.cardImg.filters))

                })
            } else {
                // if (!child.selectable) { 
                child.alpha = 0.35;
                // }

            }
        })
        this.allCards = this.allCards.filter(el => el.selectable);

    }

    private switchCardsonSuccessfulSubstitution(card1: Card, card2: Card) {
        const card1newXDir = card2.cardImg.x > card1.cardImg.x ? "+" : "-";
        const dist1 = Math.abs(card2.cardImg.x - card1.cardImg.x)
        const card1newX = `${card1newXDir}=${dist1}`;

        const card1newYDir = card2.cardImg.y > card1.cardImg.y ? "+" : "-";
        const dist2 = Math.abs(card2.cardImg.y - card1.cardImg.y)
        const card1newY = `${card1newYDir}=${dist2}`;

        const card2newXDir = card1.cardImg.x > card2.cardImg.x ? "+" : "-";
        const dist3 = Math.abs(card1.cardImg.x - card2.cardImg.x)
        const card2newX = `${card2newXDir}=${dist3}`;

        const card2newYDir = card1.cardImg.y > card2.cardImg.y ? "+" : "-";
        const dist4 = Math.abs(card1.cardImg.y - card2.cardImg.y)
        const card2newY = `${card2newYDir}=${dist4}`;

        this.container.setChildIndex(card1, this.container.children.length - 1);
        this.container.setChildIndex(card2, this.container.children.length - 2);

        gsap.to(card1.children, 0.5, { x: card1newX, y: card1newY, ease: "Back.easeInOut" });
        gsap.to(card2.children, 0.5, { x: card2newX, y: card2newY, ease: "Back.easeInOut" });

        const card1Index = this.players.indexOf(this.players.find(x => x === card1.stats)!);
        const card2Index = this.players.indexOf(this.players.find(x => x === card2.stats)!);

        if (card1.stats.substitute !== card2.stats.substitute) {
            card1.stats.substitute = !card1.stats.substitute;
            card2.stats.substitute = !card2.stats.substitute;
        }

        const temp = this.players[card1Index];
        this.players[card1Index] = this.players[card2Index];
        this.players[card2Index] = temp;

        this.checkSaveAllowed();

    }

    private checkIfSubstitute(idx: number) {
        return this.players[idx].substitute;
    }

    private addButtons() {

        //  SAVE BUTTON
        let saveOnPointerDown = () => {
            this.recordData();
            this.addSavedtext();
            this.checkContinueAllowed();
            App.EE.emit("edit_team_complete");
        }
        this.saveBtn = new RotatingButton("", "", saveOnPointerDown);
        this.container.addChild(this.saveBtn.finalTexture);
        this.saveBtn.setButtonSize(App.height * 0.1, App.width * 1.2, this.container.height * 0.2);
        this.saveBtn.addLabel(`Save`, 0.4);
        gsap.to([this.saveBtn.finalTexture, this.saveBtn.label], 0.3, {
            delay: 0.8,
            ease: "Back.easeOut",
            x: App.width * 0.9,
            onComplete: () => { }
        });

        //--BACK BUTTON
        let backOnPointerDown = () => {
            // this fixes bug with mixing subs.... : (
            for (let i = 0; i < this.players.length; i++) {
                App.playerLineUp[i].substitute = i < 6 ? false : true;
            }
            gsap.to([this.saveBtn.finalTexture, this.saveBtn.label], 0.3, {
                delay: 0.1,
                ease: "Back.easeIn",
                x: App.width * 1.2,
                onComplete: () => {
                    gsap.delayedCall(0.25, () => {
                        // this.checkContinueAllowed();// ??????????????? // PROBLEM
                        App.removeScene(this);
                    });
                }
            });
            gsap.to([this.backBtn.finalTexture, this.backBtn.label], 0.3, {
                // delay: 0.2,
                ease: "Back.easeIn",
                x: App.width * 1.2,
                onComplete: () => { }
            });
        }
        this.backBtn = new RotatingButton("", "", backOnPointerDown, true);
        this.container.addChild(this.backBtn.finalTexture);
        this.backBtn.setButtonSize(App.height * 0.1, App.width * 1.2, this.container.height * 0.1);
        this.backBtn.addLabel(`Back`, 0.4);
        this.checkContinueAllowed();
        gsap.to([this.backBtn.finalTexture, this.backBtn.label], 0.3, {
            delay: 0.9,
            ease: "Back.easeOut",
            x: App.width * 0.9,
            onComplete: () => { }
        });
    }

    private checkContinueAllowed = () => {
        const continueDisabled = App.playerLineUp
            .slice(0, 6)
            .find(el => el.leagueRedCards || el.leagueYellowCards === 5 || el.injured > 0);
        if (continueDisabled) {
            gsap.delayedCall(0.1, () => {
                this.backBtn.finalTexture.interactive = false;
                this.backBtn.finalTexture.alpha = 0.4;
            })
        } else {
            this.backBtn.finalTexture.interactive = true;
            this.backBtn.finalTexture.alpha = 1;
        }
    }

    private addSavedtext() {
        //changes saved text
        this.saveBtn.interactive = false;
        const style = new TextStyle({
            fontFamily: config.mainFont,
            fill: '#32cf56',
            align: 'center',
            stroke: '#000000',
            fontWeight: "800",
            lineJoin: "bevel",
            strokeThickness: 6
        });

        let changesSaved = createText(`saved`, style, this, App.height / 2, - 400, 0.5, 0.5, App.height / 8);

        gsap.to(changesSaved, 0.35, {
            // delay: 0.3,
            ease: "Back.easeOut",
            x: App.width / 2,
            onComplete: () => { }
        });
        gsap.to(changesSaved, 0.35, {
            delay: 1.1,
            ease: "Back.easeIn",
            x: App.width + 400,
            onComplete: () => {
                // App.stage.removeChild(changesSaved);
                this.saveBtn.interactive = true;
            }
        });

        changesSaved.anchor.set(0.5, 0.5);
        this.addChild(changesSaved);
        // TweenMax.delayedCall(0.75, () => {
        // this.app.stage.removeChild(changesSaved);
        // });
    }

    private recordData() {
        let club = App.allClubs.find((t: { name: string; }) => t.name === this.clubName)
        club.players = this.players;
        App.playerLineUp = this.players;
        recordClubPlayersParams(false, () => { });
    }

    private checkSaveAllowed() {
        const saveDisabled = this.players
            .slice(0, 6)
            .find(el => el.leagueRedCards || el.leagueYellowCards === 5 || el.injured > 0);
        if (saveDisabled) {
            this.saveBtn.interactive = false;
            this.saveBtn.alpha = 0.4;
        } else {
            this.saveBtn.interactive = true;
            this.saveBtn.alpha = 1;
        }
    }
}

export interface IY_positions {
    starting: number;
    F: number;
    MD: number;
    DF: number;
    GK: number;
}

export interface IPlayersCount {
    starting: number;
    F: number;
    MD: number;
    DF: number;
    GK: number;
}
