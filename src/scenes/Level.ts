import { App, IScene } from "../App";
import { Container, DisplayObject, Graphics, Sprite } from "pixi.js";
import gsap from "gsap";
import { config } from "../configs/MainGameConfig";
import { MatchStartPopup } from "../popups/MatchStartPopup";
import LevelCardsSet from "../game_level/LevelCardsSet";
import Grid from "../game_level/Grid";
import NewRoundPopup from "../popups/NewRoundPopup";
import WaitingOpponentPopup from "../popups/WaitingOpponentPopup";

export class Level extends Container implements IScene {

    private grid: Grid | null;
    private clubNames: string[];
    private goalAttempts: []; //????
    protected isPlayerHome: boolean;
    private currentRound: number;
    protected playerScore: number;
    protected opponentScore: number;
    private playerCardsContainer: null; //????
    private opponentCardsContainer: null; //????
    private animationInProgress: boolean; //????
    private playerActiveDefenses: null[]; //????
    private opponentActiveDefenses: null[]; //????
    private backgroundImg: Sprite;
    private info: Sprite;
    private spinningBall: Sprite;
    protected playerCards: LevelCardsSet;
    protected opponentCards: LevelCardsSet;
    private matchStartPopup: MatchStartPopup;
    private infoPopup: NewRoundPopup;
    private autoplayImg: Sprite;
    public autoplayMode: boolean;
    private waitingOpponentPopup: WaitingOpponentPopup | null;

    constructor() {
        super();
        this.name = "level";

        /**
         * "remnant" below aims to clear previous scene,
         * due to untracked bug, sometimes it does not get distroyed...
         */
        const remnant: DisplayObject = App.app.stage.getChildByName("standingsView");
        if (remnant) App.app.stage.removeChild(remnant);

        // gsap.killTweensOf("*");
        this.grid = null;
        console.log(App.playerClubData);
        console.log(App.opponentClubData);

        this.clubNames = [App.playerClubData.name, App.opponentClubData.name]; //first is players club
        this.goalAttempts = [];
        this.isPlayerHome = App.isPlayerHome;
        App.isPlayerTurn = this.isPlayerHome;
        this.currentRound = 0;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.playerCardsContainer = null;
        this.opponentCardsContainer = null;
        this.animationInProgress = true;
        this.playerActiveDefenses = Array(13).fill(null);     // 13 is max that fits within screen width
        this.opponentActiveDefenses = Array(13).fill(null);   // 13 is max that fits within screen width
        this.addBG();

        this.createCards().catch(err => {
            console.log('Run failed (does not matter which task)!');
            throw err;
        });

        App.EE.on("waiting_opponent", (showPopup: boolean) => {
            this.waitingOpponent(showPopup);
        });
    }

    private dataRecieved = () => {
        this.matchStartPopup = new MatchStartPopup();
        this.addChild(this.matchStartPopup);
    }

    public update(time: number): void { }

    public addBG(): void {
        this.backgroundImg = Sprite.from("pitch");
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);
    }

    private addAdditionalChildren = () => {
        //info
        this.info = Sprite.from("info");
        this.info.anchor.set(1, 0.5);
        this.info.x = App.width;
        this.info.y = App.height / 2;
        this.info.width = App.width / 11;
        this.info.scale.y = this.info.scale.x;
        this.addChild(this.info);
        this.info.interactive = true;
        this.info.on('pointerdown', () => {
            this.infoPopup = new NewRoundPopup(false, false);
            this.addChild(this.infoPopup);
        });

        //spinning ball
        this.spinningBall = Sprite.from("ball_prototype");
        this.spinningBall.anchor.set(0.5, 0.5);
        this.spinningBall.x = App.width * 0.96;
        this.spinningBall.y = App.height * (this.isPlayerHome ? 0.85 : 0.15);
        this.spinningBall.height = App.height * 0.04;
        this.spinningBall.scale.x = this.spinningBall.scale.y;
        this.addChild(this.spinningBall);
        gsap.to(this.spinningBall, 3000, {
            rotation: 3600
        });

        //autoplay
        this.autoplayImg = Sprite.from("icon-auto");
        this.autoplayImg.anchor.set(1, 0.5);
        this.autoplayImg.x = App.width;
        this.autoplayImg.y = App.height * 0.45;
        this.autoplayImg.width = App.width / 12;
        this.autoplayImg.scale.y = this.autoplayImg.scale.x;
        this.addChild(this.autoplayImg);
        this.autoplayImg.interactive = true;
        this.autoplayImg.tint = 0xffffff;

        this.autoplayImg.on('pointerdown', () => {
            this.autoplayMode = !this.autoplayMode;
            this.autoplayImg.tint = this.autoplayMode ? 0x2cb62c : 0xffffff;
            if (App.isPlayerTurn && !this.animationInProgress) {
                this.animationInProgress = true;
                this.grid!.proceedToNextRound();
            }
        });
    }

    public onIntroFinish = () => {
        this.grid = new Grid();
        this.addChild(this.grid);
        // // this.addSnow();
    }

    // private  addSnow = () => {
    //     this.snowContainer = new Particles(this.app, this);
    //     this.addChild(this.snowContainer.container);
    //     this.snowContainer.update();
    // }


    public createCards = async () => {
        let [player, opponent] = await
            Promise.all(
                [
                    new LevelCardsSet("player", this.clubNames[0]),
                    new LevelCardsSet("opponent", this.clubNames[1])
                ]
            );
        this.playerCards = player;
        this.addChild(this.playerCards);
        this.opponentCards = opponent;
        this.addChild(this.opponentCards);
        this.dataRecieved();
    };

    private waitingOpponent(showPopup: boolean) {
        if (showPopup) {
            console.log("waiting opponent!!!!!!!!");
            this.waitingOpponentPopup = new WaitingOpponentPopup();
            this.addChild(this.waitingOpponentPopup);
            setTimeout(() => {
                App.app.ticker.stop();
            }, 100);
        }
        else {
            console.log(" remove waiting opponent!!!!!!!!");
            this.removeChild(this.waitingOpponentPopup!);
            this.waitingOpponentPopup = null;
            setTimeout(() => {
                App.app.ticker.start();
            }, 100);
        }
    }
}
