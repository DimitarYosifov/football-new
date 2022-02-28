import { Container, Graphics, Loader, Text, TextStyle } from "pixi.js";
import { assets } from "../Assets";
import { IScene, App } from "../App";
import { config } from "../configs/MainGameConfig";
import LogIn from "./LogIn";
import gsap from "gsap";

export class LoadingScene extends Container implements IScene {

    private loaderBar: Container = new Container;
    private textsContainer: Container = new Container;
    private loaderBarBorder: Graphics = new Graphics;
    private loaderBarFill: Graphics = new Graphics;
    private loadingText: Text;
    private loadingValue: Text;

    constructor() {
        super();

        Loader.shared.add(assets);
        Loader.shared.onProgress.add(this.downloadProgress, this);
        Loader.shared.onComplete.once(this.gameLoaded, this);
        Loader.shared.load();

        this.loadBarGraphics();
        this.loadingTexts();
    }

    private loadBarGraphics() {
        const loaderBarWidth = App.width * 0.7;

        this.loaderBarFill.beginFill(0x5a5a5a, 1)
        this.loaderBarFill.drawRoundedRect(0, 0, loaderBarWidth, 5, 3);
        this.loaderBarFill.endFill();
        this.loaderBarFill.scale.x = 0;

        this.loaderBarBorder.lineStyle(10, 0xedef4e, 1);
        this.loaderBarBorder.drawRoundedRect(0, 0, loaderBarWidth, 5, 3);

        this.loaderBar.addChild(this.loaderBarFill);
        this.loaderBar.addChild(this.loaderBarBorder);
        this.loaderBar.position.x = (App.width - this.loaderBar.width) / 2;
        this.loaderBar.position.y = (App.height - this.loaderBar.height) / 2;
        this.addChild(this.loaderBar);
    }

    private loadingTexts() {
        const style: TextStyle = new TextStyle({
            fontFamily: config.mainFont,
            fontSize: 35,
            fill: '#000000',
            align: 'center',
            stroke: '#dbb7b7',
            fontWeight: "800",
            strokeThickness: 3
        });
        this.loadingText = new Text('LOADING...', style);
        this.loadingText.anchor.set(0.5, 0)
        this.loadingText.position.set(App.width / 2, 420)
        this.textsContainer.addChild(this.loadingText);

        this.loadingValue = new Text('0%', style);
        this.loadingValue.anchor.set(0.5, 0)
        this.loadingValue.position.set(App.width / 2, 485)
        this.textsContainer.addChild(this.loadingValue);
        this.addChild(this.textsContainer);
    }

    private downloadProgress(loader: Loader): void {
        const progressRatio = loader.progress / 100;
        this.loaderBarFill.scale.x = progressRatio;
        this.loadingValue.text = `${Math.ceil(progressRatio * 100)}%`;
    }

    private gameLoaded(): void {
        /** 
         *   determine which scene to show: login/register, standigs view or mode selection
         */
        App.storageData = localStorage.getItem('match3football');
        App.removeScene(this);
        if (!config.hasLogin) {
            // REMOVES LOGIN PHASE..FOR TESTS ONLY
            App.checkGameInProgress();
        } else {
            if (App.storageData) {
                App.checkUserData();
            } else {
                new LogIn();
            }
        }
        gsap.delayedCall(0.01, () => {
            App.fade(0, 1).then(() => { });
        })
    }

    public update(framesPassed: number): void {};

    public addBG() { };
}
