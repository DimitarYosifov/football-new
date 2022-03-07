import { Level } from "../scenes/Level";
import { Container, Sprite } from "pixi.js";
import gsap from "gsap";
import { App } from "../App";

export class MatchStartPopup extends Container {

    private delayBetweenSteps: number;
    private playerClubStars: Sprite[] = [];
    private opponentClubStars: Sprite[] = [];
    // private mainContainer: Container = new Container();
    private homeTeamScore: number;
    private awayTeamScore: number;
    private container1: Container = new Container();
    private container2: Container = new Container();
    private playerClubLogo: Sprite;
    private opponentClubLogo: Sprite;
    private playerClubPower: number;
    private opponentClubPower: number;
    private level: any;

    constructor() {
        super();
        this.level = App.app.stage.getChildByName("level");
        this.delayBetweenSteps = .15;
        this.homeTeamScore = App.isPlayerHome ? this.level.playerScore : this.level.opponentScore;
        this.awayTeamScore = App.isPlayerHome ? this.level.opponentScore : this.level.playerScore;
        this.create();
    }

    private create() {
        gsap.delayedCall(1, () => {
            App.isPlayerHome ? this.showPlayerLogo() : this.showOpponentLogo();
        })
    }

    private bounceOpponentStars() {
        for (let starIdx = 0; starIdx < App.opponentClubData.power; starIdx++) {
            let newAtkVal;
            let newDefVal;
            for (let cardIdx = 0; cardIdx < this.level.playerCards.children.length; cardIdx++) {
                gsap.delayedCall(starIdx * this.delayBetweenSteps, () => {
                    this.level.playerCards.children[cardIdx].stats.attack_full++;
                    this.level.playerCards.children[cardIdx].stats.defense_full++
                    newAtkVal = this.level.playerCards.children[cardIdx].stats.attack_full;
                    newDefVal = this.level.playerCards.children[cardIdx].stats.defense_full;
                    this.level.playerCards.children[cardIdx].attackValuesText.text = `0/${newAtkVal}`
                    this.level.playerCards.children[cardIdx].defenseValuesText.text = `0/${newDefVal}`
                })
            }

            let target = this.opponentClubStars[starIdx];
            let scaleValue = target.scale.x;

            gsap.to(target.scale, .4, {
                x: scaleValue * 1.5,
                y: scaleValue * 1.5,
                yoyo: true,
                repeat: 1,
                delay: starIdx * this.delayBetweenSteps
            });
        }
        gsap.delayedCall(App.opponentClubData.power * this.delayBetweenSteps + 1, () => {
            gsap.to(this.container2, .5, {
                width: 0,
                height: 0,
                alpha: 0,
                y: App.height / 2,
                x: App.width / 2,
                onComplete: () => {
                    this.removeChildren();
                    if (App.isPlayerHome) {
                        this.parent.removeChild(this);
                        this.level.onIntroFinish();
                    } else {
                        this.showPlayerLogo();
                    }
                }
            });
        })
    }

    private bouncePlayerStars() {
        for (let starIdx = 0; starIdx < App.playerClubData.power; starIdx++) {
            let newAtkVal;
            let newDefVal;
            for (let cardIdx = 0; cardIdx < this.level.opponentCards.children.length; cardIdx++) {
                gsap.delayedCall(starIdx * this.delayBetweenSteps, () => {
                    this.level.opponentCards.children[cardIdx].stats.attack_full++;
                    this.level.opponentCards.children[cardIdx].stats.defense_full++
                    newAtkVal = this.level.opponentCards.children[cardIdx].stats.attack_full;
                    newDefVal = this.level.opponentCards.children[cardIdx].stats.defense_full;
                    this.level.opponentCards.children[cardIdx].attackValuesText.text = `0/${newAtkVal}`
                    this.level.opponentCards.children[cardIdx].defenseValuesText.text = `0/${newDefVal}`
                })
            }

            let target = this.playerClubStars[starIdx];
            let scaleValue = target.scale.x;

            gsap.to(target.scale, .4, {
                x: scaleValue * 1.5,
                y: scaleValue * 1.5,
                yoyo: true,
                repeat: 1,
                delay: starIdx * this.delayBetweenSteps
            });
        }
        gsap.delayedCall(App.playerClubData.power * this.delayBetweenSteps + 1, () => {
            gsap.to(this.container1, .5, {
                width: 0,
                height: 0,
                alpha: 0,
                y: App.height / 2,
                x: App.width / 2,
                onComplete: () => {
                    this.removeChildren();
                    if (App.isPlayerHome) {
                        this.showOpponentLogo();
                    } else {
                        this.parent.removeChild(this);
                        this.level.onIntroFinish();
                    }
                }
            });
        })
    }

    private showPlayerLogo() {
        this.container1.alpha = 0;

        //PLAYER CLUB LOGO
        this.playerClubLogo = Sprite.from(`${App.playerClubData.logo}`);
        this.playerClubLogo.x = App.width / 2;
        this.playerClubLogo.y = App.height / 2;
        this.playerClubLogo.height = App.height / 2;
        this.playerClubLogo.scale.x = this.playerClubLogo.scale.y;
        this.playerClubLogo.anchor.set(0.5, 0.5);
        this.container1.addChild(this.playerClubLogo);

        this.addChild(this.container1);


        //PLAYER CLUB STARS
        this.playerClubPower = App.playerClubData.power;
        for (let s = 0; s < this.playerClubPower; s++) {
            const star = Sprite.from("star");
            star.height = App.height * 0.07;
            star.scale.x = star.scale.y;
            star.x = this.playerClubLogo.x - star.width * s + star.width * this.playerClubPower / 2 - star.width / 2;
            star.y = this.playerClubLogo.y - this.playerClubLogo.height / 2 - star.height / 2;
            star.anchor.set(0.5, 0.5);
            this.container1.addChild(star);
            this.playerClubStars.push(star);
        }

        let initialWidth = this.container1.width;
        let initialHeight = this.container1.height;

        this.container1.x = App.width / 2;
        this.container1.y = App.height / 2;
        this.container1.width = 0;
        this.container1.height = 0;

        gsap.to(this.container1, .5, {
            width: initialWidth,
            height: initialHeight,
            alpha: 1,
            y: 0,
            x: 0,
            onComplete: () => {
                this.bouncePlayerStars();
            }
        });
    }

    private showOpponentLogo() {

        this.container2.alpha = 0;
        this.addChild(this.container2);

        //OPPONENT CLUB LOGO
        this.opponentClubLogo = Sprite.from(`${App.opponentClubData.logo}`);
        this.opponentClubLogo.x = App.width / 2;
        this.opponentClubLogo.y = App.height / 2;
        this.opponentClubLogo.height = App.height / 2;
        this.opponentClubLogo.scale.x = this.opponentClubLogo.scale.y;
        this.opponentClubLogo.anchor.set(0.5, 0.5);
        this.container2.addChild(this.opponentClubLogo);

        //OPPONENT CLUB STARS
        this.opponentClubPower = App.opponentClubData.power;
        for (let s = 0; s < this.opponentClubPower; s++) {
            const star = Sprite.from("star");
            star.height = App.height * 0.07;
            star.scale.x = star.scale.y;
            star.x = this.opponentClubLogo.x - star.width * s + star.width * this.opponentClubPower / 2 - star.width / 2;
            star.y = this.opponentClubLogo.y - this.opponentClubLogo.height / 2 - star.height / 2;
            star.anchor.set(0.5, 0.5);
            this.container2.addChild(star);
            this.opponentClubStars.push(star);
        }
        let initialWidth = this.container2.width;
        let initialHeight = this.container2.height;

        this.container2.x = App.width / 2;
        this.container2.y = App.height / 2;
        this.container2.width = 0;
        this.container2.height = 0;

        gsap.to(this.container2, .5, {
            width: initialWidth,
            height: initialHeight,
            alpha: 1,
            y: 0,
            x: 0,
            onComplete: () => {
                this.bounceOpponentStars();
            }
        });
    }
}
