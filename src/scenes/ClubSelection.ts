import { IScene, App } from "../App";
import { recordClubPlayersParams } from "../recordClubPlayersParams";
import { Container, Sprite, Graphics, Loader, Text, TextStyle, Texture, ParticleContainer } from "pixi.js";
import gsap from "gsap";
import { config } from "../configs/MainGameConfig";
import { ServerRequest } from "../ServerRequest"
import { StandingsView } from "./StandingsView"
import { Level } from "./Level";
import PvPRoom from "./PvPRoom";

export class ClubSelection extends Container implements IScene {

    private backgroundImg: Sprite;
    private positions: IPositions[];
    private mode: string;
    private selectClub: Text;
    private clubContainers: Container[] = [];

    constructor(mode: string) {
        super();
        this.mode = mode;
        this.addBG();
        this.alpha = 0;
        this.positions = [
            {
                x: App.width / 4,
                y: App.height * 0.37
            },
            {
                x: App.width * 0.75,
                y: App.height * 0.37
            },
            {
                x: App.width / 4,
                y: App.height * 0.55
            },
            {
                x: App.width * 0.75,
                y: App.height * 0.55
            },
            {
                x: App.width / 4,
                y: App.height * 0.73
            },
            {
                x: App.width * 0.75,
                y: App.height * 0.73
            },
            {
                x: App.width / 4,
                y: App.height * 0.91
            },
            {
                x: App.width * 0.75,
                y: App.height * 0.91
            }
        ]

        ServerRequest("getAllClubsData").then((res) => {
            App.allClubs = (res as any).clubs;
            this.createText();
            for (let clubIdx = 0; clubIdx < App.allClubs.length; clubIdx++) {
                this.showClub(App.allClubs[clubIdx], this.positions[clubIdx]);
            }
        });
    }

    public addBG(): void {
        this.backgroundImg = Sprite.from("bg435");
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);

        let bg_cover = new Graphics;
        bg_cover.beginFill(0x000000, 0.75);
        bg_cover.drawRect(
            0,
            0,
            App.width,
            App.height
        );
        bg_cover.endFill();
        this.addChild(bg_cover);
    }

    public update(time: number): void { };

    private createText(): void {
        let text = App.isPlayerTurn ? "Select club" : "Select opponent"
        this.selectClub = new Text(text, {
            fontFamily: config.mainFont,
            fontSize: App.height / 13,
            fill: '#000000',
            align: 'center',
            stroke: '#ffffff',
            fontWeight: "800",
            lineJoin: "bevel",
            strokeThickness: 6
        });
        this.selectClub.position.set(App.width / 2, App.height * 0.15);
        this.selectClub.anchor.set(0.5, 0.5);
        this.addChild(this.selectClub);
    }

    private showClub(club: any, position: IPositions): void {
        let container = new Container;
        this.addChild(container);

        let name = new Text(`${club.name}`, {
            fontFamily: config.mainFont,
            fontSize: App.height / 30,
            fill: '#ffffff',
            align: 'center'
        });

        name.position.set(
            position.x,
            position.y
        );
        name.anchor.set(0.5, 0.5);
        container.addChild(name);

        let logo = Sprite.from(`${club.clubData.logo}`);
        logo.x = name.x;
        logo.y = name.y - name.height / 2;
        logo.height = App.height / 10;
        logo.scale.x = logo.scale.y;
        logo.anchor.set(0.5, 1);
        container.addChild(logo);
        logo.interactive = true;
        logo.on('pointerup', () => {
            logo.interactive = false;
            App.isPlayerTurn ? App.playerClubData = club.clubData : App.opponentClubData = club.clubData;
            this.removeChild(this.selectClub);
            App.friendly = this.mode === "friendly";
            App.pvpGame = this.mode === "PvP";
            if (!App.friendly && !App.pvpGame) {
                this.clubContainers.forEach(element => {
                    if (element !== container) {
                        gsap.to(element, 1,
                            {
                                alpha: 0
                            }
                        );
                    } else {
                        let x = App.width / 2 - container.getLocalBounds().x - container.width / 2;
                        let y = App.height / 2 - container.getLocalBounds().y - container.height / 2;
                        gsap.to(container, 0.3,
                            {
                                delay: 1,
                                x: x,
                                y: y,
                                ease: "Back.easeOut",
                                onComplete: () => {
                                    this.pivot.x = 270;
                                    this.x = 270;
                                    this.pivot.y = 480;
                                    this.y = 480;

                                    gsap.to(this.scale, 0.5,
                                        {
                                            x: 3,
                                            y: 3,
                                            onUpdate: () => { },
                                            ease: "Bounce.easeOut",
                                            onComplete: () => {
                                                gsap.delayedCall(1, () => {
                                                    recordClubPlayersParams(false, () => {
                                                        App.removeScene(this);
                                                        App.setScene(new StandingsView());
                                                        gsap.delayedCall(0.01, () => {
                                                            App.fade(0, 1).then(() => { });
                                                        })
                                                    });
                                                })
                                            }
                                        },
                                    );
                                }
                            },
                        );
                    }
                });
            }
            else if (!App.pvpGame) {
                if (App.isPlayerTurn) {
                    container.alpha = 0;
                    App.isPlayerTurn = false;
                    this.createText();
                } else {
                    /**
                     * friendly game starts here
                     */

                    App.isPlayerHome = true;
                    App.removeScene(this);
                    App.setScene(new Level());
                    gsap.delayedCall(0.01, () => {
                        App.fade(0, 1).then(() => { });
                    })
                }
            } else {
                App.isPlayerHome = true; // this is wrong - should be determined later!!!!!
                App.removeScene(this);
                App.setScene(new PvPRoom());
                gsap.delayedCall(0.01, () => {
                    App.fade(0, 1).then(() => { });
                })
            }
        })

        let power = club.clubData.power;
        for (let s = 0; s < power; s++) {
            const star = Sprite.from("star");
            star.height = App.height * 0.015;
            star.scale.x = star.scale.y;
            star.x = logo.x - star.width * s + star.width * power / 2;
            star.y = logo.y - logo.height;
            star.anchor.set(1, 1);
            container.addChild(star);
        }
        this.clubContainers.push(container);
    }
}

export interface IPositions {
    x: number;
    y: number;
}
