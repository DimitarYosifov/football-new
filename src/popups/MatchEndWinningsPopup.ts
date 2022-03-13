import { Container, Graphics, TextStyle, Text, AnimatedSprite, Texture, Sprite } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import { matchEndWinningsPopup } from "../configs/MatchEndWinningsConfig";
import { createText } from "../createText";
import BangUp from "../BangUp";
import { recordClubPlayersParams } from "../recordClubPlayersParams";
import { StandingsView } from "../scenes/StandingsView";
import { RotatingButton } from "../buttons/RotatingButton";
import gsap from "gsap";

export default class MatchEndWinningsPopup extends Container {

    private level: any;
    private result: string;
    private totalWinnings: number;
    private totalYellowCards: number;
    private totalRedCards: number;
    private totalInjuries: number;
    private finePerRedCard: number;
    private finePerYellowCard: number;
    private injurieExpense: number;
    private totalYellowCardsFine: number;
    private totalRedCardsFine: number;
    private totalInjuriesExpenses: number;
    private points: number;
    private cashPerPoint: number;
    private totalPointsWinnings: number;
    private goals: number;
    private cashPerGoal: number;
    private totalGoalsWinnings: number;
    private cashPerTicket: number;
    private tickets: number;
    private totalTicketsWinnings: number;
    private bg: Graphics;
    private cover: Graphics;
    private summatyText: Text;
    private timeline: GSAPTimeline;
    private pointsRowContainer: Container;
    private goalsRowContainer: Container;
    private ticketsRowContainer: Container;
    private yellowCardsRowContainer: Container;
    private redCardsRowContainer: Container;
    private injuriesExpensesRowContainer: Container;
    private pointsBangUp: Container;
    private coin: AnimatedSprite;
    private totalWinningsText: Text;
    private pointsText: Text;
    private pointsTextValue: Text;
    private totalPointsWinningText: Text;
    private pointsCoinImg: Sprite;
    private goalsValueText: Text;
    private goalsText: Text;
    private goalsCoinImg: Sprite;
    private ticketsCoinImg: Sprite;
    private totalTicketsWinningsText: Text;
    private ticketsTextValue: Text;
    private ticketsText: Text;
    private yellowCardsImg: Sprite;
    private yellowCardsCoinImg: Sprite;
    private yellowCardsAmountText: Text;
    private yellowCardsFineText: Text;
    private redCardsImg: Sprite;
    private redCardsAmountText: Text;
    private totalRedCardsFineText: Text;
    private redCardsCoinImg: Sprite;
    private injuriesImg: Sprite;
    private injuriesAmountText: Text;
    private totalInjuriesExpensesText: Text;
    private injuryCoinImg: Sprite;
    private contionueBtn: RotatingButton;
    private skipBtn: RotatingButton;
    private totalYellowCardsFineText: Text;
    private totalGoalsWinningText: Text;
    private opponentCards: []; //???
    private currentTimelineLabel: string;

    constructor() {
        super();
        this.level = App.app.stage.getChildByName("level");
        this.opponentCards = this.level.opponentCards;
        this.result = `${this.level.playerScore}-${this.level.opponentScore}`;
        if (!App.isPlayerHome) this.result = this.result.split("").reverse().join("");
        this.totalWinnings = 0;

        this.totalYellowCards = this.level.playerCards.children.filter((c: { hasYellowCard: any; }) => c.hasYellowCard).length;
        this.totalRedCards = this.level.playerCards.children.filter((c: { hasRedCard: any; }) => c.hasRedCard).length;
        this.totalInjuries = this.level.playerCards.children.filter((c: { hasInjury: any; }) => c.hasInjury).length;

        this.finePerYellowCard = matchEndWinningsPopup.yellowCardFine;
        this.finePerRedCard = matchEndWinningsPopup.redCardFine;
        let minInjuryCost = matchEndWinningsPopup.injuriesExpenses.min;
        let maxInjuryCost = matchEndWinningsPopup.injuriesExpenses.max;
        this.injurieExpense = this.getRandomInt(minInjuryCost, maxInjuryCost);

        //YELLOW CARDS
        this.totalYellowCardsFine = this.totalYellowCards * this.finePerYellowCard;

        //RED CARDS
        this.totalRedCardsFine = this.totalRedCards * this.finePerRedCard;

        //INJURIES
        this.totalInjuriesExpenses = this.totalInjuries * this.injurieExpense;

        //POINTS
        this.points = 0;
        if (this.level.playerScore > this.level.opponentScore) {
            this.points = 3;
        }
        else if (this.level.playerScore === this.level.opponentScore) {
            this.points = 1;
        }
        this.cashPerPoint = matchEndWinningsPopup.cashPerPoint;
        this.totalPointsWinnings = this.points * this.cashPerPoint;

        //GOALS
        this.goals = this.level.playerScore;
        this.cashPerGoal = matchEndWinningsPopup.cashPerGoal;
        this.totalGoalsWinnings = this.goals * this.cashPerGoal;

        ///TICKETS
        const playerClubPower = App.playerClubData.power;
        const opponentClubPower = App.opponentClubData.power;
        let min = 0;
        let max = 0;
        if (App.isPlayerHome) {
            min = matchEndWinningsPopup.attendance.home[playerClubPower].min;
            max = matchEndWinningsPopup.attendance.home[playerClubPower].max;
            this.cashPerTicket = matchEndWinningsPopup.ticketPrice[playerClubPower];
        } else {
            min = matchEndWinningsPopup.attendance.away[playerClubPower].min;
            max = matchEndWinningsPopup.attendance.away[playerClubPower].max;
            this.cashPerTicket = matchEndWinningsPopup.ticketPrice[opponentClubPower];
        }
        this.tickets = this.getRandomInt(min, max);
        this.totalTicketsWinnings = this.tickets * this.cashPerTicket;

        this.create();
        this.addCoinAnimation();
        this.pointsWinnings();
        this.goalsWinnings();
        this.ticketsWinnings();
        this.yellowCardsFine();
        this.redCardsFine();
        this.injuriesExpenses();
        this.createTimeLine();
    }

    private create() {
        //BG
        this.bg = new Graphics();
        this.bg.beginFill(0x000000, 0.85);
        this.bg.drawRect(
            0,
            0,
            App.width,
            App.height
        );
        this.bg.endFill();
        this.addChild(this.bg);
        this.bg.interactive = true;


        // SUMMARY TEXT
        const style = new TextStyle({
            fontFamily: config.mainFont,
            fontSize: App.height / 20,
            fill: '#dbb7b7',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: "400"
        })
        this.summatyText = createText(`GAME SUMMARY`, style, this, App.height * 0.1, App.width / 2, 0.5, 0, App.height / 20);
    }

    private createTimeLine() {
        this.timeline = gsap.timeline();
        this.timeline.to(this.pointsRowContainer, 1.5,
            {
                alpha: 1,
                onStart: () => {
                    this.skip();
                    this.currentTimelineLabel = "goalsRow";
                },
                onComplete: () => {
                    this.startPointsBangUps();
                }
            }
        ).addLabel("pointsRow");
        this.timeline.to(this.goalsRowContainer, 1.5,
            {
                delay: 1,
                alpha: 1,
                onStart: () => {
                    this.currentTimelineLabel = "ticketsRow";
                },
                onComplete: () => {
                    this.startGoalsBangUps();
                }
            }
        ).addLabel("goalsRow");;
        this.timeline.to(this.ticketsRowContainer, 1.5,
            {
                delay: 1,
                alpha: 1,
                onStart: () => {
                    this.currentTimelineLabel = "yellowCardsRow";
                },
                onComplete: () => {
                    this.startTicketsBangUps();
                }
            }
        ).addLabel("ticketsRow");
        this.timeline.to(this.yellowCardsRowContainer, 1.5,
            {
                delay: 1,
                alpha: 1,
                onStart: () => {
                    this.currentTimelineLabel = "redCardsRow";
                },
                onComplete: () => {
                    this.startYellowCardsBangUps();
                }
            }
        ).addLabel("yellowCardsRow");
        this.timeline.to(this.redCardsRowContainer, 1.5,
            {
                delay: 1,
                alpha: 1,
                onStart: () => {
                    this.currentTimelineLabel = "redCardsRow";
                },
                onComplete: () => {
                    this.startRedCardsBangUps();
                }
            }
        ).addLabel("injuriesExpensesRow");
        this.timeline.to(this.injuriesExpensesRowContainer, 1.5,
            {
                delay: 1,
                alpha: 1,
                onStart: () => {
                    this.currentTimelineLabel = "injuriesExpensesRow";
                },
                onComplete: () => {
                    this.startInjuriesBangUps();
                    this.skipOnPointerDown();
                }
            }
        ).addLabel("");
        this.addCover();
    }

    private startPointsBangUps() {
        const pointsBangUp = new BangUp(this.totalPointsWinningText, 1, this.totalPointsWinnings, 0, 0);
        const totalWinningsBangUp1 = new BangUp(this.totalWinningsText, 1, 0, this.totalPointsWinnings + this.totalWinnings, 0);
        this.totalWinnings += this.totalPointsWinnings;
    }

    private startGoalsBangUps() {
        const goalsBangUp = new BangUp(this.totalGoalsWinningText, 1, this.totalGoalsWinnings, 0, 0);
        const totalWinningsBangUp = new BangUp(this.totalWinningsText, 1, this.totalWinnings, this.totalGoalsWinnings + this.totalWinnings, 0);
        this.totalWinnings += this.totalGoalsWinnings;
    }

    private startTicketsBangUps() {
        const ticketssBangUp = new BangUp(this.totalTicketsWinningsText, 1, this.totalTicketsWinnings, 0, 0);
        const totalWinningsBangUp = new BangUp(this.totalWinningsText, 1, this.totalWinnings, this.totalTicketsWinnings + this.totalWinnings, 0);
        this.totalWinnings += this.totalTicketsWinnings;
    }

    private startYellowCardsBangUps() {
        const yellowCardsBangUp = new BangUp(this.totalYellowCardsFineText, 1, this.totalYellowCardsFine, 0, 0);
        const totalWinningsBangUp = new BangUp(this.totalWinningsText, 1, this.totalWinnings, this.totalWinnings - Math.abs(+this.totalYellowCardsFine), 0);
        this.totalWinnings -= this.totalYellowCardsFine;
    }

    private startRedCardsBangUps() {
        const redCardsBangUp = new BangUp(this.totalRedCardsFineText, 1, this.totalRedCardsFine, 0, 0);
        const totalWinningsBangUp = new BangUp(this.totalWinningsText, 1, this.totalWinnings, this.totalWinnings - Math.abs(+this.totalRedCardsFine), 0);
        this.totalWinnings -= this.totalRedCardsFine;
    }

    private startInjuriesBangUps() {
        const injurisBangUp = new BangUp(this.totalInjuriesExpensesText, 1, this.totalInjuriesExpenses, 0, 0);
        const totalWinningsBangUp = new BangUp(this.totalWinningsText, 1, this.totalWinnings, this.totalWinnings - Math.abs(+this.totalInjuriesExpenses), 0);
        this.totalWinnings -= this.totalInjuriesExpenses;
    }

    private addCoinAnimation() {
        let coinAnimData = {
            name: "coins_anim",
            frames: 10,
            speed: 0.3,
            loop: true,
            paused: false
        }
        let frames = [];
        for (let frame = 1; frame <= coinAnimData.frames; frame++) {
            let current = `${coinAnimData.name}_${frame}`;
            frames.push(current);
        }
        this.coin = new AnimatedSprite(frames.map((s) => Texture.from(s)));
        this.coin.width = this.width * 0.2;
        this.coin.scale.y = this.coin.scale.x;
        this.coin.x = App.width / 2 - this.coin.width;
        this.coin.y = App.height * 0.18;
        this.coin.animationSpeed = coinAnimData.speed;
        this.coin.play();
        this.addChild(this.coin);

        // TOTAL WINNINGS TEXT
        const style = new TextStyle({
            fontFamily: config.mainFont,
            // fontSize: App.height / 16,
            fill: '#dbb7b7',
            stroke: '#000000',
            strokeThickness: 3,
            fontWeight: "400"
        })
        this.totalWinningsText = createText("" + this.totalWinnings, style, this, App.height * 0.2, App.width * 0.55, 0, 0, App.height / 16);
    }

    private pointsWinnings() {
        this.pointsRowContainer = new Container();
        this.pointsRowContainer.alpha = 0;

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        // POINTS TEXT
        this.pointsText = createText("Points", getStyle(), this.pointsRowContainer, App.height * 0.305, App.width * 0.1, 0, 0, App.height / 30);

        // POINTS VALUES
        this.pointsTextValue = createText(`${this.points} x ${this.cashPerPoint}`, getStyle(), this.pointsRowContainer, App.height * 0.305, App.width * 0.35, 0, 0, App.height / 30);

        // TOTAL POINTS WINNINGS  
        this.totalPointsWinningText = createText(`${this.totalPointsWinnings}`, getStyle(), this.pointsRowContainer, App.height * 0.305, App.width * 0.85, 1, 0, App.height / 30);

        // COIN IMG
        this.pointsCoinImg = Sprite.from(`coin`);
        this.pointsCoinImg.height = App.height * 0.03;
        this.pointsCoinImg.x = this.totalPointsWinningText.x;
        this.pointsCoinImg.y = App.height * 0.3125;
        this.pointsCoinImg.scale.x = this.pointsCoinImg.scale.y;
        this.pointsRowContainer.addChild(this.pointsCoinImg);

        this.addChild(this.pointsRowContainer);
    }

    private goalsWinnings() {
        this.goalsRowContainer = new Container();
        this.goalsRowContainer.alpha = 0;

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        // GOALS TEXT
        this.goalsText = createText("Goals", getStyle(), this.goalsRowContainer, App.height * 0.385, App.width * 0.1, 0, 0, App.height / 30);

        // GOALS VALUES
        this.goalsValueText = createText(`${this.goals} x ${this.cashPerGoal}`, getStyle(), this.goalsRowContainer, App.height * 0.385, App.width * 0.35, 0, 0, App.height / 30);

        // TOTAL POINTS WINNINGS  
        this.totalGoalsWinningText = createText(`${this.totalGoalsWinnings}`, getStyle(), this.goalsRowContainer, App.height * 0.385, App.width * 0.85, 1, 0, App.height / 30);

        // COIN IMG
        this.goalsCoinImg = Sprite.from(`coin`);
        this.goalsCoinImg.height = App.height * 0.03;
        this.goalsCoinImg.x = this.totalGoalsWinningText.x;
        this.goalsCoinImg.y = App.height * 0.3925;
        this.goalsCoinImg.scale.x = this.goalsCoinImg.scale.y;
        this.goalsRowContainer.addChild(this.goalsCoinImg);

        this.addChild(this.goalsRowContainer);
    }

    private ticketsWinnings() {
        this.ticketsRowContainer = new Container();
        this.ticketsRowContainer.alpha = 0;

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        // TICKETS TEXT
        this.ticketsText = createText("Tickets", getStyle(), this.ticketsRowContainer, App.height * 0.465, App.width * 0.1, 0, 0, App.height / 30);

        // TICKETS VALUES
        this.ticketsTextValue = createText(`${this.tickets} x ${this.cashPerTicket}`, getStyle(), this.ticketsRowContainer, App.height * 0.465, App.width * 0.35, 0, 0, App.height / 30);

        // TOTAL TICKETS WINNINGS  
        this.totalTicketsWinningsText = createText(`${this.totalTicketsWinnings}`, getStyle(), this.ticketsRowContainer, App.height * 0.465, App.width * 0.85, 1, 0, App.height / 30);

        // COIN IMG
        this.ticketsCoinImg = Sprite.from(`coin`);
        this.ticketsCoinImg.height = App.height * 0.03;
        this.ticketsCoinImg.x = this.totalTicketsWinningsText.x;
        this.ticketsCoinImg.y = App.height * 0.4725;
        this.ticketsCoinImg.scale.x = this.ticketsCoinImg.scale.y;
        this.ticketsRowContainer.addChild(this.ticketsCoinImg);

        this.addChild(this.ticketsRowContainer);
    }

    private yellowCardsFine() {
        this.yellowCardsRowContainer = new Container();
        this.yellowCardsRowContainer.alpha = 0;

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        this.yellowCardsImg = Sprite.from(`yellow_card`);
        this.yellowCardsImg.height = App.height * 0.05;
        this.yellowCardsImg.scale.x = this.yellowCardsImg.scale.y;
        this.yellowCardsRowContainer.addChild(this.yellowCardsImg);
        this.yellowCardsImg.anchor.set(0, 0);
        this.yellowCardsImg.position.set(App.width * 0.1, App.height * 0.545);

        // YELLOW CARDS AMOUNT
        this.yellowCardsAmountText = createText(`${this.totalYellowCards} x ${this.finePerYellowCard}`, getStyle(), this.yellowCardsRowContainer, App.height * 0.545, App.width * 0.35, 0, 0, App.height / 30);

        // TOTAL YELLOW CARDS FINE 
        this.totalYellowCardsFineText = createText(`-${this.totalYellowCardsFine}`, getStyle(), this.yellowCardsRowContainer, App.height * 0.545, App.width * 0.85, 1, 0, App.height / 30);

        // COIN IMG
        this.yellowCardsCoinImg = Sprite.from(`coin`);
        this.yellowCardsCoinImg.height = App.height * 0.03;
        this.yellowCardsCoinImg.x = this.totalYellowCardsFineText.x;
        this.yellowCardsCoinImg.y = App.height * 0.5525;
        this.yellowCardsCoinImg.scale.x = this.yellowCardsCoinImg.scale.y;
        this.yellowCardsRowContainer.addChild(this.yellowCardsCoinImg);

        this.addChild(this.yellowCardsRowContainer);
    }

    private redCardsFine() {
        this.redCardsRowContainer = new Container();
        this.redCardsRowContainer.alpha = 0;

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        this.redCardsImg = Sprite.from(`red_card`);
        this.redCardsImg.height = App.height * 0.05;
        this.redCardsImg.scale.x = this.redCardsImg.scale.y;
        this.redCardsRowContainer.addChild(this.redCardsImg);
        this.redCardsImg.anchor.set(0, 0);
        this.redCardsImg.position.set(App.width * 0.1, App.height * 0.625);

        // RED CARDS AMOUNT
        this.redCardsAmountText = createText(`${this.totalRedCards} x ${this.finePerRedCard}`, getStyle(), this.redCardsRowContainer, App.height * 0.625, App.width * 0.35, 0, 0, App.height / 30);

        // TOTAL RED CARDS FINE 
        this.totalRedCardsFineText = createText(`-${this.totalRedCardsFine}`, getStyle(), this.redCardsRowContainer, App.height * 0.625, App.width * 0.85, 1, 0, App.height / 30);

        // COIN IMG
        this.redCardsCoinImg = Sprite.from(`coin`);
        this.redCardsCoinImg.height = App.height * 0.03;
        this.redCardsCoinImg.x = this.totalRedCardsFineText.x;
        this.redCardsCoinImg.y = App.height * 0.6325;
        this.redCardsCoinImg.scale.x = this.redCardsCoinImg.scale.y;
        this.redCardsRowContainer.addChild(this.redCardsCoinImg);

        this.addChild(this.redCardsRowContainer);
    }

    private injuriesExpenses() {
        this.injuriesExpensesRowContainer = new Container();
        this.injuriesExpensesRowContainer.alpha = 0;

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        this.injuriesImg = Sprite.from(`red_cross`);
        this.injuriesImg.height = App.height * 0.05;
        this.injuriesImg.scale.x = this.injuriesImg.scale.y;
        this.injuriesExpensesRowContainer.addChild(this.injuriesImg);
        this.injuriesImg.anchor.set(0, 0);
        this.injuriesImg.position.set(App.width * 0.1, App.height * 0.695);

        // INJURIES AMOUNT
        this.injuriesAmountText = createText(`${this.totalInjuriesExpenses}`, getStyle(), this.injuriesExpensesRowContainer, App.height * 0.705, App.width * 0.35, 0, 0, App.height / 30);

        // TOTAL INJURIES EXPENSES 
        this.totalInjuriesExpensesText = createText(`-${this.totalInjuriesExpenses}`, getStyle(), this.injuriesExpensesRowContainer, App.height * 0.705, App.width * 0.85, 1, 0, App.height / 30);

        // COIN IMG
        this.injuryCoinImg = Sprite.from(`coin`);
        this.injuryCoinImg.height = App.height * 0.03;
        this.injuryCoinImg.x = this.totalInjuriesExpensesText.x;
        this.injuryCoinImg.y = App.height * 0.7125;
        this.injuryCoinImg.scale.x = this.injuryCoinImg.scale.y;
        this.injuriesExpensesRowContainer.addChild(this.injuryCoinImg);

        this.addChild(this.injuriesExpensesRowContainer);
    }

    private skipOnPointerDown = () => {
        this.timeline.progress(1);
        this.skipBtn.interactive = false;
        this.continue();
        gsap.to([this.skipBtn.finalTexture, this.skipBtn.label], 0.35, {
            // delay: 1.2,
            ease: "Back.easeOut",
            y: App.height * 1.2,
            onComplete: () => {
                this.removeChild(this.skipBtn.finalTexture);
            }
        });
    }

    private skip() {
        //  SKIP BUTTON
        this.skipBtn = new RotatingButton("", "", this.skipOnPointerDown);
        this.addChild(this.skipBtn.finalTexture);
        this.skipBtn.setButtonSize(App.height * 0.2, App.width * 0.5, App.height * 1.25);
        this.skipBtn.addLabel(`Skip`, 0.25);
        this.skipBtn.interactive = false;
        gsap.to([this.skipBtn.finalTexture, this.skipBtn.label], 0.35, {
            delay: 1.2,
            ease: "Back.easeOut",
            y: App.height * 0.85,
            onComplete: () => {
                this.skipBtn.interactive = true;
            }
        });
    }

    private continue() {
        //  CONTINUE BUTTON
        let continueOnPointerDown = () => {
            console.log("exit match winnings popup");

            this.contionueBtn.interactive = false;
            App.lastGameWinnings = +this.totalWinningsText.text;
            recordClubPlayersParams(true, () => { });
            App.removeScene(this.level);
            App.setScene(new StandingsView(true, this.result, true, this.opponentCards));
            gsap.delayedCall(0.01, () => {
                App.fade(0, 1).then(() => { });
            })
        }
        this.contionueBtn = new RotatingButton("", "", continueOnPointerDown);
        this.addChild(this.contionueBtn.finalTexture);
        this.contionueBtn.setButtonSize(App.height * 0.2, App.width * 0.5, App.height * 1.25);
        this.contionueBtn.addLabel(`Continue`, 0.25);
        this.contionueBtn.interactive = false;
        gsap.to([this.contionueBtn.finalTexture, this.contionueBtn.label], 0.35, {
            delay: 0.35,
            ease: "Back.easeOut",
            y: App.height * 0.85,
            onComplete: () => {
                this.contionueBtn.interactive = true;
            }
        });
    }

    private getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private addCover() {
        // this.cover = new Graphics();
        // this.cover.beginFill(0x00ffff, 0.4);
        // this.cover.drawRect(
        //     0,
        //     0,
        //     App.width,
        //     App.height
        // );
        // this.cover.endFill();
        // this.addChild(this.cover);
        // this.cover.interactive = true;
        // this.cover.on('pointerdown', this.skip, this);
    }

    // private skip() {
    //     this.timeline.seek(this.currentTimelineLabel);
    // }
}
