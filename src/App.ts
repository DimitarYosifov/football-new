import { Application, DisplayObject } from "pixi.js";
import gsap from "gsap";
import { ServerRequest } from "./ServerRequest"
import LogIn from "./scenes/LogIn";
import { ModeSelection } from "./scenes/ModeSelection";

export class App {

    public static user: string | null;

    private constructor() { }

    private static app: Application;
    private static currentScene: IScene;

    private static _width: number;
    private static _height: number;

    // G A M E   D A T A ---
    public static storageData: any; // TODO - interface
    public static allClubs: any;
    public static playerClubData: any;
    public static opponentClubData: any;
    public static friendly: boolean;
    public static isPlayerHome: boolean;
    public static isPlayerTurn: boolean = true;
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
            resolution: window.devicePixelRatio || 1,
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
            'POST',
        ).then((res: any) => {
            if (res.data) {
                // standingsView.bind(this)(res.data);// setSCene
            } else {
                this.setScene(new ModeSelection());
            }
        })
    }
}

// This could have a lot more generic functions that you force all your scenes to have. Update is just an example.
// Also, this could be in its own file...
export interface IScene extends DisplayObject {
    update(framesPassed: number): void;
    addBG(): void;
}
