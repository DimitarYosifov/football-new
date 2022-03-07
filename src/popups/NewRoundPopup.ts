import { Container, Graphics, Sprite, Text } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import MatchEndWinningsPopup from "./MatchEndWinningsPopup";
import gsap from "gsap";

export default class NewRoundPopup extends Container {

    private matchFinished: boolean;
    private lastRound: boolean;
    private level: any;
    private bg: Graphics;
    private homeTeamScore: number;
    private awayTeamScore: number;
    private currentRound: Text;
    private result: Text;
    private continueBtnLabel: Text;
    private playerTeamName: Text;
    private playerClubLogo: Sprite;
    private playerClubPower: number;
    private opponentTeamName: Text;
    private opponentClubLogo: Sprite;
    private opponentClubPower: number;
    private continueBtn: Sprite;

    constructor(matchFinished: boolean, lastRound: boolean) {
        super();
        this.level = App.app.stage.getChildByName("level");
        this.matchFinished = matchFinished;
        this.lastRound = lastRound;
        this.homeTeamScore = this.level.isPlayerHome ? this.level.playerScore : this.level.opponentScore;
        this.awayTeamScore = this.level.isPlayerHome ? this.level.opponentScore : this.level.playerScore;
        this.create();
    }

    create() {
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
        this.bg.interactive = true;
        this.bg.on('pointerdown', () => {
            if (!this.matchFinished) {
                this.remove();
            }
        });
        if (this.matchFinished) {
            // GAME IS OVER
            this.currentRound = new Text(`FINAL SCORE`, {
                fontFamily: config.mainFont,
                fontSize: App.height / 10,
                fill: '#000000',
                align: 'center',
                stroke: '#dbb7b7',
                fontWeight: "800",
                lineJoin: "bevel",
                strokeThickness: 6
            });
            this.currentRound.position.set(App.width / 2, App.height * 0.25);
            this.currentRound.anchor.set(0.5, 0.5);
            this.addChild(this.currentRound);
        } else {
            // CURRENT ROUND TEXT
            let text = this.lastRound ? "Last Round" : `Round ${this.level.currentRound}/20`
            this.currentRound = new Text(`${text}`, {
                fontFamily: config.mainFont,
                fontSize: App.height / 10,
                fill: '#000000',
                align: 'center',
                stroke: '#dbb7b7',
                fontWeight: "800",
                lineJoin: "bevel",
                strokeThickness: 6
            });
            this.currentRound.position.set(App.width / 2, App.height * 0.25);
            this.currentRound.anchor.set(0.5, 0.5);
            this.addChild(this.currentRound);
        }

        //RESULT
        this.result = new Text(`${this.homeTeamScore}-${this.awayTeamScore}`, {
            fontFamily: config.mainFont,
            fontSize: App.height / 12,
            fill: '#ffffff',
            fontWeight: '800',
            stroke: '#000000',
            strokeThickness: 6
        });
        this.result.position.set(App.width / 2, App.height * 0.62);
        this.result.anchor.set(0.5, 0);
        this.addChild(this.result);

        //PLAYER CLUB NAME
        this.playerTeamName = new Text(`${this.level.clubNames[0]}`, {
            fontFamily: config.mainFont,
            fontSize: App.height / 20,
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            fontWeight: "800",
            lineJoin: "bevel",
            strokeThickness: 6
        });
        this.playerTeamName.position.set(
            App.width * (this.level.isPlayerHome ? 0.25 : 0.75),
            App.height * 0.6
        );
        this.playerTeamName.anchor.set(0.5, 0.5);
        this.addChild(this.playerTeamName);

        //PLAYER CLUB LOGO
        this.playerClubLogo = Sprite.from(`${App.playerClubData.logo}`);
        this.playerClubLogo.x = this.playerTeamName.x;
        this.playerClubLogo.y = this.playerTeamName.y - this.playerTeamName.height / 2;
        this.playerClubLogo.height = App.height / 6;
        this.playerClubLogo.scale.x = this.playerClubLogo.scale.y;
        this.playerClubLogo.anchor.set(0.5, 1);
        this.addChild(this.playerClubLogo);

        //PLAYER CLUB STARS
        this.playerClubPower = App.playerClubData.power;
        for (let s = 0; s < this.playerClubPower; s++) {
            const star = Sprite.from("star");
            star.height = App.height * 0.025;
            star.scale.x = star.scale.y;
            star.x = this.playerClubLogo.x - star.width * s + star.width * this.playerClubPower / 2;
            star.y = this.playerClubLogo.y - this.playerClubLogo.height;
            star.anchor.set(1, 1);
            this.addChild(star);
        }

        //-----------------------------------------------------------------------------------------------

        //OPPONENT CLUB NAME
        this.opponentTeamName = new Text(`${this.level.clubNames[1]}`, {
            fontFamily: config.mainFont,
            fontSize: App.height / 20,
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            fontWeight: "800",
            lineJoin: "bevel",
            strokeThickness: 6
        });
        this.opponentTeamName.position.set(
            App.width * (this.level.isPlayerHome ? 0.75 : 0.25),
            App.height * 0.6
        );
        this.opponentTeamName.anchor.set(0.5, 0.5);
        this.addChild(this.opponentTeamName);

        //OPPONENT CLUB LOGO
        this.opponentClubLogo = Sprite.from(`${App.opponentClubData.logo}`);
        this.opponentClubLogo.x = this.opponentTeamName.x;
        this.opponentClubLogo.y = this.opponentTeamName.y - this.opponentTeamName.height / 2;
        this.opponentClubLogo.height = App.height / 6;
        this.opponentClubLogo.scale.x = this.opponentClubLogo.scale.y;
        this.opponentClubLogo.anchor.set(0.5, 1);
        this.addChild(this.opponentClubLogo);

        //OPPONENT CLUB STARS
        this.opponentClubPower = App.opponentClubData.power; // should be taken from level!!  TODO............
        for (let s = 0; s < this.opponentClubPower; s++) {
            const star = Sprite.from("star");
            star.height = App.height * 0.025;
            star.scale.x = star.scale.y;
            star.x = this.opponentClubLogo.x - star.width * s + star.width * this.opponentClubPower / 2;
            star.y = this.opponentClubLogo.y - this.opponentClubLogo.height;
            star.anchor.set(1, 1);
            this.addChild(star);
        }

        if (this.matchFinished) {
            gsap.globalTimeline.clear();
            //continue button
            this.level.grid.interactive = false;
            this.continueBtn = Sprite.from("btn1");
            this.continueBtn.height = App.height * 0.1;
            this.continueBtn.scale.x = this.continueBtn.scale.y;
            this.continueBtn.x = App.width / 2;
            this.continueBtn.y = App.height * 0.8;
            this.continueBtn.anchor.set(0.5);
            this.continueBtn.interactive = true;
            this.continueBtn.interactive = true;
            this.continueBtn.on('pointerdown', () => {
                if (App.friendly) {
                    location.reload();
                } else {
                    // match end
                    let matchEndWinningsPopup = new MatchEndWinningsPopup();
                    this.parent.addChild(matchEndWinningsPopup);

                    this.parent.removeChild(this);
                    console.log(this);
                    console.log(this.parent);

                    gsap.delayedCall(0.01, () => {
                        App.fade(0, 1).then(() => { });
                    })
                }
            });
            this.addChild(this.continueBtn);

            this.continueBtnLabel = new Text(`Continue`, {
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

        } else {
            gsap.delayedCall(2, () => {
                this.remove();
            })
        }
    }

    remove() {
        if (this.parent) {
            this.parent.removeChild(this);
        }
        // this.app.level.animationInProgress = !this.app.playerTurn;
        if (this.level.grid && this.level.grid.hasGoalsInThisRound) {
            this.level.grid.hasGoalsInThisRound = false;
        }
    }
}
