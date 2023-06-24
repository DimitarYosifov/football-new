import { Container, Sprite, Texture, Text, TextStyle } from "pixi.js";
import { App } from "../App";
import gsap from "gsap";
import { config } from "../configs/MainGameConfig";
import { Card } from "./Card";
import { createText } from "../createText";

export class InitialRandomBallPoints extends Container {

    private redBall: Sprite;
    private blueBall: Sprite;
    private purpleBall: Sprite;
    private greenBall: Sprite;
    private yellowBall: Sprite;
    private balls: Sprite[] = [];
    private level: any;

    constructor() {
        super();
        this.name = "";
        this.redBall = Sprite.from(`ball_red`);
        this.blueBall = Sprite.from(`ball_blue`);
        this.purpleBall = Sprite.from(`ball_purple`);
        this.greenBall = Sprite.from(`ball_green`);
        this.yellowBall = Sprite.from(`ball_yellow`);
        this.level = App.app.stage.getChildByName("level");
        this.createBalls();
    }

    private createBalls() {
        this.redBall = Sprite.from(`ball_red`);
        this.blueBall = Sprite.from(`ball_blue`);
        this.purpleBall = Sprite.from(`ball_purple`);
        this.greenBall = Sprite.from(`ball_green`);
        this.yellowBall = Sprite.from(`ball_yellow`);
        this.balls = [this.redBall, this.blueBall, this.purpleBall, this.greenBall, this.yellowBall];
        const positions = [0.166, 0.333, 0.50, 0.666, 0.833];
        for (let index = 0; index < this.balls.length; index++) {
            //ball
            const ball = this.balls[index];
            ball.anchor.set(0.5);
            ball.width = App.width / 7.5;
            ball.height = ball.width;
            ball.y = App.height / 2;
            ball.x = App.width * positions[index];
            this.addChild(ball);
            //text
            let text = new Text(`5`, {
                fontFamily: config.mainFont,
                fontSize: 85,
                fill: '#000000',
                align: 'center',
                stroke: '#dbb7b7',
                fontWeight: "800",
                strokeThickness: 3
            });
            // text.position.set(App.width / 2, App.height * 0.62);
            text.anchor.set(0.5, 0.5);
            ball.addChild(text);
            this.mix(ball);
            gsap.delayedCall(1.6, () => { this.addPoints(ball) });
        }
    }

    mix(ball: Sprite) {
        const iritations = 15;
        const interval = 0.1;
        for (let index = 0; index < iritations; index++) {
            gsap.delayedCall(interval * (index + 1), () => {
                let rndNum = Math.floor(Math.random() * 6);
                (ball.children[0] as Text).text = `${rndNum}`;
            })
        }
    }

    addPoints(ball: Sprite) {

        let colors: any = {
            "ball_red": "FF1D00",     // RED:
            "ball_blue": "3052FF",    // BLUE:
            "ball_green": "2F7F07",   // GREEN:
            "ball_yellow": "E2D841",  // YELLOW:
            "ball_purple": "B200FF"   // PURPLE:
        }
        console.log(this.level.playerCards);

        const add = (card: Card, cardIndex: number) => {
            let defense_color = card.stats.defense_color;
            let attack_color = card.stats.attack_color;

            let ballColor = colors[ball.texture.textureCacheIds[0]];
            let reward = (ball.children[0] as Text).text;

            if ((defense_color !== ballColor && attack_color !== ballColor) || +reward === 0) return;

            if (defense_color === ballColor) {
                const style = new TextStyle({
                    fontFamily: config.mainFont,
                    fill: '#' + defense_color,
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                })
                card.stats.defense_current = +reward;
                card.defenseValuesText.text = `${reward}/${card.stats.defense_full}`;
                let def_text = createText(`+${reward}`, style, this.parent.parent, card.cardImg.y + card.height / 2, card.cardImg.x + card.cardImg.width / 2, 0.5, 0.5, card.cardImg.height / 2);
                gsap.to(def_text, 1.5, {
                    delay: cardIndex * 0.05,
                    y: this.parent.parent.height / 2,
                    ease: "Linear.easeNone",
                    onComplete: () => {
                        def_text.alpha = 0;
                        // this.parent.parent.removeChild(def_text);
                    }
                })
            }
            if (attack_color === ballColor) {
                const style = new TextStyle({
                    fontFamily: config.mainFont,
                    fill: '#' + attack_color,
                    align: 'center',
                    stroke: '#000000',
                    strokeThickness: 2
                })
                card.stats.attack_current = +reward;
                card.attackValuesText.text = `${reward}/${card.stats.attack_full}`;
                let attack_text = createText(`+${reward}`, style, this.parent.parent, card.cardImg.y + card.height / 2, card.cardImg.x + card.cardImg.width / 2, 0.5, 0.5, card.cardImg.height / 2);
                gsap.to(attack_text, 1.5, {
                    delay: 0.15 + (cardIndex * 0.05),
                    y: this.parent.parent.height / 2,
                    ease: "Linear.easeNone",
                    onComplete: () => {
                        attack_text.alpha = 0;
                        // this.parent.parent.removeChild(attack_text);
                    }
                })
            }
        }

        this.level.playerCards.children.forEach((card: Card, cardIndex: number) => {
            add(card, cardIndex);
        });

        this.level.opponentCards.children.forEach((card: Card, cardIndex: number) => {
            add(card, cardIndex);
        });
    }
}
