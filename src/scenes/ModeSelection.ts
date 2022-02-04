// import { clubSelection } from "./clubSelection.js";
// import Background from "./Background.js";
// import GameTexture from "./GameTexture.js";
// import Particles from "./AddParticles.js";
import { IScene, App } from "../App";
import { Container, Sprite, Graphics, Loader, Text, TextStyle, Texture, ParticleContainer } from "pixi.js";
import { Emitter, EmitterConfig } from "pixi-particles";
import gsap from "gsap";
import { friendlyParticleConfig } from "../configs/particleConfigs/friendlyParticleConfig";
import { leagueParticleConfig } from "../configs/particleConfigs/leagueParticleConfig";
import { config } from "../configs/MainGameConfig";
import { starParticleConfig } from "../configs/ParticleConfigs/starParticleConfig";

export class ModeSelection extends Container implements IScene {

    private targetX: number;
    private backgroundImg: Sprite;
    private flyingBall: Sprite;
    private flyingBallTimeline: gsap.core.Timeline;
    private friendly: Text;
    private league: Text;
    private textStyles: TextStyle;
    private emitters: Emitter[] = [];

    constructor() {
        super();
        this.targetX = App.width / 2;
        this.textStyles = new TextStyle({
            fontFamily: config.mainFont,
            fontSize: App.height / 13,
            fill: '#000000',
            align: 'center',
            stroke: '#ffffff',
            fontWeight: "800",
            lineJoin: "bevel",
            strokeThickness: 6
        });

        App.fade(0, 1).then(() => {
            const loadingWrapper = document.getElementById("loading-wrapper");
            if (loadingWrapper) { loadingWrapper.remove() };
            this.addBG();
            this.createFlyingBall();
            this.createflyingBallTimeline();
            this.addFriendly();
            this.addLeague();
        });
    }

    public addBG() {
        this.backgroundImg = Sprite.from("bg909");
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);
    }

    private addFriendly() {
        this.friendly = new Text('Friendly', this.textStyles);
        this.friendly.position.set(-this.friendly.width / 2, App.height * 0.45);
        this.friendly.anchor.set(0.5, 0.5);
        this.friendly.interactive = true;
        const friendlyScale = this.friendly.scale.x;
        this.friendly.on('pointerup', (e: Event) => {
            this.modeSelected("friendly");
        })
        this.friendly.on('pointerover', (e: Event) => {
            gsap.to(this.friendly.scale, 0.15,
                {
                    x: friendlyScale * 1.05,
                    y: friendlyScale * 1.05
                });
        })
        this.friendly.on('pointerout', (e: Event) => {
            gsap.to(this.friendly.scale, 0.15,
                {
                    x: friendlyScale,
                    y: friendlyScale
                });
        })
        this.addChild(this.friendly);
    }

    private addLeague() {
        this.league = new Text('League', this.textStyles);
        this.league.position.set(App.width + this.league.width / 2, App.height * 0.55);
        this.league.anchor.set(0.5, 0.5);
        this.league.interactive = true;
        this.league.on('pointerup', (e: Event) => {
            this.modeSelected("league");
        })
        const leagueScale = this.friendly.scale.x;
        this.league.on('pointerover', (e: Event) => {
            gsap.to(this.league.scale, 0.15,
                {
                    x: leagueScale * 1.05,
                    y: leagueScale * 1.05
                });
        })
        this.league.on('pointerout', (e: Event) => {
            gsap.to(this.league.scale, 0.15,
                {
                    x: leagueScale,
                    y: leagueScale
                });
        })
        this.addChild(this.league);
    }

    private modeSelected(mode: string) {

        this.friendly.interactive = false;
        this.league.interactive = false;

        this.star_Particles();

        const target = mode === "friendly" ? this.league : this.friendly;

        gsap.to(target, 0.35, { alpha: 0.3 });

        gsap.delayedCall(1, () => {
            gsap.to(this.league, 0.3,
                {
                    ease: "Back.easeOut",
                    x: App.width + this.league.width / 2
                }
            );
            gsap.to(this.friendly, 0.3,
                {
                    delay: 0.1,
                    ease: " Back.easeOut",
                    x: -this.friendly.width / 2
                }
            );

            App.fade(1, 0).then(() => {
                // set new scene TODO...
                // alert(`peoceed to clubSelection - TODO`);
                // clubSelection(this.app, mode);
            });
        })
    }


    private startParticles() {
        let container = new ParticleContainer;
        this.addChild(container)
        //tween friendly text
        gsap.to(this.friendly, 0.4,
            {
                ease: "Back.easeOut",
                x: this.targetX
            });

        //friendly particle
        let friendlyEmitter: Emitter = new Emitter(
            container,
            ["flame"],
            friendlyParticleConfig()
        );
        friendlyEmitter.emit = true;
        this.emitters.push(friendlyEmitter);
        gsap.delayedCall(0.2, () => {
            friendlyEmitter!.emit = false;
            gsap.delayedCall(1, () => {
                friendlyEmitter.destroy();
                friendlyEmitter.cleanup();
                friendlyEmitter.update = (): void => { };
            });
        });

        // tween league text
        gsap.delayedCall(0.4, () => {
            gsap.to(this.league, 0.4,
                {
                    ease: "Back.easeOut",
                    x: this.targetX,
                    onComplete: () => {
                        gsap.to(this.backgroundImg, 0.6, {
                            alpha: 0.6
                        })
                    }
                });
        });

        // league particle
        gsap.delayedCall(0.4, () => {
            let leagueEmitter: Emitter = new Emitter(
                container,
                [Texture.from("flame")],
                leagueParticleConfig()
            );
            leagueEmitter.emit = true;
            this.emitters.push(leagueEmitter);
            gsap.delayedCall(0.2, () => {
                leagueEmitter.emit = false;
                gsap.delayedCall(1, () => {
                    leagueEmitter.destroy();
                    leagueEmitter.cleanup();
                    leagueEmitter.update = (): void => { };
                });
            });
        });
    }

    //flying ball
    private createFlyingBall() {
        this.flyingBall = Sprite.from("ball_prototype");
        this.flyingBall.anchor.set(0.5);
        this.flyingBall.position.set(App.width / 2, App.height * 0.91);
        this.flyingBall.height = App.height * 0.01;
        this.flyingBall.scale.x = this.flyingBall.scale.y;
        this.addChild(this.flyingBall);
    }

    private createflyingBallTimeline() {
        let startW = this.flyingBall.width;
        let startH = this.flyingBall.height;

        this.flyingBallTimeline = gsap.timeline({ paused: false });
        this.flyingBallTimeline.timeScale(3.5);
        this.flyingBallTimeline.to(this.flyingBall, 1.5,
            {
                x: App.width / 2,
                y: App.height * 0.3,
                width: startW * 2.5,
                height: startH * 2.5,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.25,
                width: startW * 3.25,
                height: startH * 3.25,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.2,
                width: startW * 4,
                height: startH * 4,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.15,
                width: startW * 5,
                height: startH * 5,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.1,
                width: startW * 5.75,
                height: startH * 5.75,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.09,
                width: startW * 6.5,
                height: startH * 6.5,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.09,
                width: startW * 7.25,
                height: startH * 7.25,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.1,
                width: startW * 8,
                height: startH * 8,
                ease: "none"
            }
        );
        this.flyingBallTimeline.to(this.flyingBall, 0.15,
            {
                y: App.height * 0.12,
                width: startW * 9,
                height: startH * 9,
                ease: "none",
                onStart: () => {
                    gsap.delayedCall(0.17, () => {
                        this.star_Particles();
                        gsap.delayedCall(0.4, () => {
                            this.startParticles();
                        })
                    })
                }
            }
        );

        this.flyingBallTimeline.to(this.flyingBall, 0.6,
            {
                y: App.height * 0.5,
                width: startW * 30,
                height: startH * 30,
                ease: "none"
            }
        );
    }

    private star_Particles() {
        let container = new ParticleContainer;
        this.addChildAt(container, 1)
        let starEmitter: Emitter = new Emitter(
            container,
            [Texture.from("star-particle")],
            starParticleConfig()
        );
        starEmitter.emit = true;
        this.emitters.push(starEmitter);
        gsap.delayedCall(0.75, () => {
            starEmitter.emit = false;
            gsap.delayedCall(1.5, () => {
                starEmitter.destroy();
                starEmitter.cleanup();
                starEmitter.update = (): void => { };
            });
        });
    }

    public update(time: number): void {
        // console.log(framesPassed);
        this.emitters.forEach((emitter) => {
            if (emitter.parent) {
                emitter.update((time * 0.01))
            }
        });
    }
}
