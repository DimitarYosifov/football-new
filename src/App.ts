import { Application, DisplayObject } from "pixi.js";
import gsap from "gsap";
import { ServerRequest } from "./ServerRequest"
import LogIn from "./scenes/LogIn";
import { ModeSelection } from "./scenes/ModeSelection";
import { SeasonFixtures } from "./SeasonFixtures";
import { StandingsView } from "./scenes/StandingsView";

export class App {

    public static user: string | null;

    // private constructor() { }

    public static app: Application;
    private static currentScene: IScene;

    private static _width: number;
    private static _height: number;

    // G A M E   D A T A ---
    public static storageData: string | null;
    public static allClubs: any;
    public static teams: ITeamData[];
    public static playerClubData: any;
    public static opponentClubData: any;
    public static friendly: boolean;
    public static isPlayerHome: boolean;
    public static isPlayerTurn: boolean = true;
    public static allClubNames: string[];
    public static seasonFixtures: any; // TODO - interface
    public static topScorers: ITopScorers;
    public static mostYellowCards: IMostYellowCards;
    public static playerCash: number;
    public static leagueRounds: number;
    public static level: any;// TODO - interface when level is implemented
    public static lastGameWinnings: number;
    public static playerLineUp: IPlayerLineUp[];
    // G A M E   D A T A ---

    public static get width(): number {
        return App._width;
    }
    public static get height(): number {
        return App._height;
    }

    public static initialize(width: number, height: number, background: number): void {
        App._width = width;
        App._height = height;

        App.app = new Application({
            view: document.getElementById("pixi-canvas") as HTMLCanvasElement,
            resolution: window.devicePixelRatio || 2,
            autoDensity: true,
            backgroundColor: background,
            width: width,
            height: height
        });

        App.app.ticker.add(App.update);
        window.addEventListener("resize", App.resize);
        App.resize();
    }

    public static resize(): void {
        const screenWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const screenHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

        const scale = Math.min(screenWidth / App.width, screenHeight / App.height);

        const enlargedWidth = Math.floor(scale * App.width);
        const enlargedHeight = Math.floor(scale * App.height);

        const horizontalMargin = (screenWidth - enlargedWidth) / 2;
        const verticalMargin = (screenHeight - enlargedHeight) / 2;

        App.app.view.style.width = `${enlargedWidth}px`;
        App.app.view.style.height = `${enlargedHeight}px`;
        App.app.view.style.marginLeft = App.app.view.style.marginRight = `${horizontalMargin}px`;
        App.app.view.style.marginTop = App.app.view.style.marginBottom = `${verticalMargin}px`;
    }

    public static setScene(newScene: IScene): void {
        App.currentScene = newScene;
        App.app.stage.addChild(App.currentScene);
    }

    public static fade(from: number, to: number) {
        App.currentScene.alpha = from;
        return new Promise<void>((resolve, reject) => {
            gsap.to(App.currentScene, 1,
                {
                    delay: 0.1,
                    alpha: to,
                    onComplete: () => {
                        resolve();
                    },
                }
            );
        })
    }

    public static removeScene(scene: IScene = App.currentScene) {
        if (scene) {
            App.app.stage.removeChild(App.currentScene);
            App.currentScene.destroy();
        }
    }

    // This update will be called by a pixi ticker and tell the scene that a tick happened
    private static update(framesPassed: number): void {
        if (App.currentScene) {
            App.currentScene.update(framesPassed);
        }
    }

    public static checkUserData() {
        ServerRequest(
            "storageData",
            JSON.stringify({
                data: App.storageData
            }),
            'POST',
        ).then((res: any) => {
            if (!res.authorized) {
                new LogIn();
            } else {
                App.user = localStorage.getItem('user');
                this.checkGameInProgress();
            }
        })
    }

    public static checkGameInProgress = () => {
        ServerRequest(
            "getFixtures",
            JSON.stringify({
                user: App.user
            }),
            "POST"
        ).then((res: any) => {
            if (res.data) {
                this.playerClubData = res.data.playerClubData;
                this.setScene(new StandingsView());
            } else {
                this.setScene(new ModeSelection());
            }
        })
    }

    public static createSeasonFixtures() {
        this.seasonFixtures = SeasonFixtures.create(App.allClubNames);
    }
}

export interface IScene extends DisplayObject {
    update(framesPassed: number): void;
    addBG(): void;
}

export interface ITeamData {
    name: string;
    won: number;
    ties: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    goalsDifference: string;
    points: number;
}

export interface ITopScorers {
    [key: string]: number[];
}

export interface IMostYellowCards {
    [key: string]: number[];
}

export interface IPlayerLineUp {
    club: any;
    img: any;
    index: any;
    yellowCards: any;
    goals: any;
    goalsScored: any;
    leagueYellowCards: any,
    [key: number]: {
        EXP: number;
        attack_color: string;
        attack_current: number;
        attack_full: number;
        defense_color: string;
        defense_current: number;
        defense_full: number;
        goalsScored: number;
        injured: number;
        leagueRedCards: boolean;
        leagueYellowCards: number;
        player_img_id: string;
        position: string;
        special: undefined;
        substitute: boolean;
    }
}
