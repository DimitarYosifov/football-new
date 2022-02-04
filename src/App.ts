import { Application, DisplayObject } from "pixi.js";
import gsap from "gsap";

export class App {

    public static user: string = ""

    private constructor() { }

    private static app: Application;
    private static currentScene: IScene;

    private static _width: number;
    private static _height: number;


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
        return new Promise<void>((resolve, reject) => {
            gsap.fromTo(App,
                { alpha: from },
                { alpha: to, duration: 1, onComplete: () => { resolve() } }
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
}

// This could have a lot more generic functions that you force all your scenes to have. Update is just an example.
// Also, this could be in its own file...
export interface IScene extends DisplayObject {
    update(framesPassed: number): void;
    addBG(): void;
}
