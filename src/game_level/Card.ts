
import { FullAttack } from "./FullAttack"
import { ActiveDefense } from "./ActiveDefense"
import { config } from "../configs/MainGameConfig";
import { Container, TextStyle, Text, Sprite, Graphics, Texture, Filter } from "pixi.js";
import { createText } from "../createText";
import { App } from "../App";
import gsap from "gsap";
import { DotFilter } from "pixi-filters";
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import { GlowFilter } from "pixi-filters";

export class Card extends Container {

    public playerPosition: string;
    public isSub: boolean;
    public selectable: boolean;
    public selected: boolean;
    public cardImg: any;      //??????????????
    public stats: any;      //??????????????
    public font_size: number;
    public index: number;
    public cardTexture: string
    public card_height: number;
    public card_width: number;
    public card_x: number;
    public card_y: number;
    public shoeTexture: string;
    public shoe_height: number;
    public shoe_width: number;
    public shoe_x: number;
    public shoe_y: number;

    public attack_text: { x: number, y: number };
    public defense_text: { x: number, y: number };

    public gloveTexture: string;
    public glove_height: number;
    public glove_width: number;
    public glove_x: number;
    public glove_y: number;

    public yellowCardTexture: string;
    public yellowCard_width: number;
    public yellowCard_x: number;
    public yellowCard_y: number;

    public injuryTexture: string;
    public injury_width: number;
    public injury_x: number;
    public injury_y: number;

    public starsTexture: string;
    public stars_width: number;
    public stars_x: number;
    public stars_y: number;

    public border_height: number;
    public border_width: number;
    public border_x: number;
    public border_y: number;
    public colors: IColors;
    public showCurrentValues: boolean;
    public goalsScored: number;
    public randomColor: boolean;
    public totalPower: number;

    private shoe: Sprite;
    private glove: Sprite;
    private yellowCard: Sprite;
    private injury: Sprite;

    public hasInjury: boolean;
    public hasYellowCard: boolean;
    public hasRedCard: boolean;

    public border: Graphics = new Graphics();

    public attackValuesText: Text;
    public defenseValuesText: Text;
    public starsContainer: Container = new Container();

    public stars: Sprite;
    public starsBG: Graphics = new Graphics();

    constructor(data: any, showCurrentValues = true, randomColor: boolean) {
        super();
        this.font_size = data.font_size;
        this.index = data.index;
        this.stats = data.stats;
        this.cardTexture = data.cardTexture;
        this.card_height = data.card_height;
        this.card_width = data.card_width;
        this.card_x = data.card_x;
        this.card_y = data.card_y;

        this.shoeTexture = data.shoeTexture;
        this.shoe_height = data.shoe_height;
        this.shoe_width = data.shoe_width;
        this.shoe_x = data.shoe_x;
        this.shoe_y = data.shoe_y;

        this.attack_text = data.attack_text;
        this.defense_text = data.defense_text;

        this.gloveTexture = data.gloveTexture;
        this.glove_height = data.glove_height;
        this.glove_width = data.glove_width;
        this.glove_x = data.glove_x;
        this.glove_y = data.glove_y;

        this.yellowCardTexture = data.yellowCardTexture;
        this.yellowCard_width = data.yellowCard_width;
        this.yellowCard_x = data.yellowCard_x;
        this.yellowCard_y = data.yellowCard_y;

        this.injuryTexture = data.injuryTexture;
        this.injury_width = data.injury_width;
        this.injury_x = data.injury_x;
        this.injury_y = data.injury_y;

        this.starsTexture = data.starsTexture;
        this.stars_width = data.stars_width;
        this.stars_x = data.stars_x;
        this.stars_y = data.stars_y;

        this.border_height = data.border_height;
        this.border_width = data.border_width;
        this.border_x = data.border_x;
        this.border_y = data.border_y;

        this.colors = {
            'FF1D00': "ball_red",     // RED:
            '3052FF': "ball_blue",    // BLUE:
            '2F7F07': "ball_green",   // GREEN:
            'E2D841': "ball_yellow",  // YELLOW:
            'B200FF': "ball_purple"   // PURPLE:
        }

        this.showCurrentValues = showCurrentValues;
        this.goalsScored = 0;
        this.randomColor = randomColor;
        this.totalPower = this.calculatePlayerStars(data.totalPower);
        this.createCard();
    }

    private createCard() {
        this.index = this.index;
        this.stats = this.stats;

        if (config.randomCardColors && this.randomColor) {
            const colors = Object.keys(this.colors);
            const atk_index = Math.floor(Math.random() * colors.length);
            const def_index = Math.floor(Math.random() * colors.length);
            this.stats.attack_color = colors[atk_index];
            this.stats.defense_color = colors[def_index];
        }

        //card background
        this.cardImg = Sprite.from(this.cardTexture);
        this.cardImg.x = this.card_x;
        this.cardImg.y = this.card_y;
        this.cardImg.width = this.card_width;
        this.cardImg.height = this.card_height;

        //attack section
        this.shoe = Sprite.from(this.shoeTexture);
        this.shoe.x = this.shoe_x;
        this.shoe.y = this.shoe_y;
        this.shoe.height = this.shoe_height;
        this.shoe.scale.x = this.shoe.scale.y;
        this.shoe.tint = +`0x${this.stats.attack_color}`;

        //defense section
        this.glove = Sprite.from(this.gloveTexture);
        this.glove.x = this.glove_x;
        this.glove.y = this.glove_y;
        this.glove.height = this.glove_height;
        this.glove.scale.x = this.glove.scale.y;
        this.glove.tint = +`0x${this.stats.defense_color}`;

        // let injuryTexture = PIXI.Texture.fromImage(this.injuryTexture);
        this.injury = Sprite.from(this.injuryTexture);
        this.injury.x = this.injury_x;
        this.injury.y = this.injury_y;
        this.injury.width = this.injury_width;
        this.injury.scale.y = this.injury.scale.x;
        this.injury.alpha = 0.75;
        this.injury.anchor.set(0.5, 0.5);
        this.injury.visible = this.stats.injured > 0;
        this.hasInjury = this.stats.injured > 0;

        // let yellowCardTexture = Sprite.from(this.yellowCardTexture);
        this.yellowCard = Sprite.from(this.yellowCardTexture);
        this.yellowCard.x = this.yellowCard_x;
        this.yellowCard.y = this.yellowCard_y;
        this.yellowCard.width = this.yellowCard_width;
        this.yellowCard.scale.y = this.yellowCard.scale.x;
        this.yellowCard.alpha = 0.75;
        this.yellowCard.anchor.set(0.5, 0.5);
        this.yellowCard.visible = false;
        this.hasYellowCard = false;
        this.hasRedCard = false;

        //border
        this.border.lineStyle(1, 0xd0c639, 1);
        this.border.drawRect(this.border_x, this.border_y, this.border_width, this.border_height);

        this.addChild(this.cardImg);

        const style1 = new TextStyle({
            fontFamily: config.mainFont,
            fill: '#' + this.stats.attack_color, align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        const style2 = new TextStyle({
            fontFamily: config.mainFont,
            fill: '#' + this.stats.defense_color, align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        });
        const attText = this.showCurrentValues ?
            this.stats.attack_current + '/' + this.stats.attack_full :
            this.stats.attack_full
        this.attackValuesText = createText(attText, style1, this, this.attack_text.y, this.attack_text.x, 1, 0, this.font_size);

        const defText = this.showCurrentValues ?
            this.stats.defense_current + '/' + this.stats.defense_full :
            this.stats.defense_full
        this.defenseValuesText = createText(defText, style2, this, this.defense_text.y, this.defense_text.x, 1, 0, this.font_size)

        this.attackValuesText.name = "attackValuesText";
        this.defenseValuesText.name = "defenseValuesText";

        //------player's stars
        for (let index = 0; index < this.totalPower; index++) {
            // let starsTexture = Sprite.from(this.starsTexture);
            this.stars = Sprite.from(this.starsTexture)
            this.stars.x = this.starsContainer.width;
            // this.stars.y = this.stars_y;
            this.stars.width = this.stars_width;
            this.stars.scale.y = this.stars.scale.x;
            this.stars.anchor.set(0, 1);
            this.starsContainer.addChild(this.stars);
        }

        this.starsContainer.x = this.stars_x - this.starsContainer.width / 2;
        this.starsContainer.y = this.stars_y;

        this.starsBG.beginFill(0x000000, 0.75);
        this.starsBG.drawRect(
            0,
            -this.starsContainer.height,
            this.starsContainer.width,
            this.starsContainer.height
        );
        this.starsBG.endFill();
        this.starsContainer.addChildAt(this.starsBG, 0);

        this.addChild(this.starsContainer);

        // this.addChild(this.attackValuesText);
        // this.addChild(this.defenseValuesText);

        this.addChild(this.shoe);
        this.addChild(this.glove);
        this.addChild(this.injury);
        this.addChild(this.yellowCard);
        this.addChild(this.border);
    }

    private increasePoints(matches: []) {

        let level: any = App.app.stage.getChildByName("level");

        let randomMatchingBlock: any = matches[Math.floor(Math.random() * matches.length)];
        let tweenStart_x = level.grid.blocks[randomMatchingBlock.row][randomMatchingBlock.col].blockImg.x;
        let tweenStart_y = level.grid.blocks[randomMatchingBlock.row][randomMatchingBlock.col].blockImg.y;

        let defenceColor = this.colors[this.stats.defense_color];
        let attackColor = this.colors[this.stats.attack_color];
        let def_points = matches.filter(e => e["type"] === defenceColor).length;
        let atk_points = matches.filter(e => e["type"] === attackColor).length;
        let initialScaleX = this.cardImg.scale.x;
        let initialScaley = this.cardImg.scale.y;

        if (def_points > 0 && !this.hasRedCard) {
            if (this.hasInjury) {
                def_points = Math.floor(def_points / 2)
            }
            this.stats.defense_current += def_points;
            if (this.stats.defense_current >= this.stats.defense_full) {
                gsap.to(this.cardImg, .15, {
                    delay: .7,
                    onComplete: () => {
                        this.cardImg.tint = 16777215;
                        this.stats.defense_current -= this.stats.defense_full;
                        this.defenseValuesText.text = `${this.stats.defense_current}/${this.stats.defense_full}`;
                    }

                });
                gsap.to(this.cardImg.scale, .15, {
                    x: initialScaleX * 1.05,
                    y: initialScaley * 1.05,
                    yoyo: true,
                    repeat: 1
                })
                this.cardImg.tint = +`0x${this.stats.defense_color}`;
                let glove = new ActiveDefense(
                    this.stats.defense_color,
                    this.card_x + this.card_width / 2,
                    this.card_y + this.card_height / 2,
                    this.colors[this.stats.defense_color]
                );
                let level = App.app.stage.getChildByName("level");
                (level as any).addChild(glove);
            }
            this.defenseValuesText.text = `${this.stats.defense_current}/${this.stats.defense_full}`;

            //TODO  create separate class for this and add some delay between text tweens
            const style2 = new TextStyle({
                fontFamily: config.mainFont,
                fill: '#' + this.stats.defense_color,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            })

            let def_text = createText("+" + def_points, style2, this.parent.parent, tweenStart_y, tweenStart_x, 0.5, 0.5, this.cardImg.height / 2.8);
            let def_sprite = Sprite.from("glove2");
            def_sprite.y = tweenStart_y;
            def_sprite.x = tweenStart_x;
            def_sprite.width = App.width / 23;
            def_sprite.scale.y = def_sprite.scale.x;
            this.parent.parent.addChild(def_sprite);

            gsap.to([def_text], 1.5, {
                x: this.cardImg.x + this.cardImg.width / 2,
                y: this.cardImg.y + this.cardImg.height / 2,
                ease: "Linear.easeNone",  //TODO... change ease
                onUpdate: () => {
                    def_sprite.y = def_text.y - def_text.height / 3;
                    def_sprite.x = def_text.x + def_text.width / 2.25;
                },
                onComplete: () => {
                    def_text.alpha = 0;
                    this.parent.parent.removeChild(def_text);
                    this.parent.parent.removeChild(def_sprite);
                }
            })
        }

        if (atk_points > 0 && !this.hasRedCard) {
            if (this.hasInjury) {
                atk_points = Math.floor(atk_points / 2)
            }
            this.stats.attack_current += atk_points;
            if (this.stats.attack_current >= this.stats.attack_full) {
                gsap.to(this.cardImg.scale, .15, {
                    x: initialScaleX * 1.05,
                    y: initialScaley * 1.05,
                    yoyo: true,
                    repeat: 1
                })
                gsap.to(this.cardImg, .15, {
                    delay: .7,
                    onComplete: () => {
                        this.cardImg.tint = 16777215;
                        this.stats.attack_current -= this.stats.attack_full;
                        this.attackValuesText.text = `${this.stats.attack_current}/${this.stats.attack_full}`;
                    }
                });
                this.cardImg.tint = +`0x${this.stats.attack_color}`;
                let fullAttackShoe = new FullAttack(
                    this.stats.attack_color,
                    this.card_x + this.card_width / 2,
                    this.card_y + this.card_height / 2,
                    this.colors[this.stats.attack_color],
                    this.index
                );
                let level = App.app.stage.getChildByName("level");
                (level as any).goalAttempts.push(fullAttackShoe);
                (level as any).addChild(fullAttackShoe);
            }
            this.attackValuesText.text = `${this.stats.attack_current}/${this.stats.attack_full}`;

            const style2 = new TextStyle({
                fontFamily: config.mainFont,
                fill: '#' + this.stats.attack_color,
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            })
            let atk_text = createText("+" + atk_points, style2, this.parent.parent, tweenStart_y, tweenStart_x, 0.5, 0.5, this.cardImg.height / 2.8);
            let att_sprite = Sprite.from("shoe");
            att_sprite.y = tweenStart_y;
            att_sprite.x = tweenStart_x;
            att_sprite.width = App.width / 17;
            att_sprite.scale.y = att_sprite.scale.x;
            this.parent.parent.addChild(att_sprite);

            gsap.to(atk_text, 1.5, {
                delay: def_points > 0 ? 0.25 : 0,
                x: this.cardImg.x + this.cardImg.width / 2,
                y: this.cardImg.y + this.cardImg.height / 2,
                ease: "Linear.easeNone",  //TODO... change ease
                onUpdate: () => {
                    att_sprite.y = atk_text.y - atk_text.height / 3.25;
                    att_sprite.x = atk_text.x + atk_text.width / 2.25;
                },
                onComplete: () => {
                    atk_text.alpha = 0;
                    this.parent.parent.removeChild(atk_text);
                    this.parent.parent.removeChild(att_sprite);
                }
            })
        }
    }

    public addLeagueCardsAndInjury(count: number, hasRedCard: boolean, injuredFor_n_games: number) {
        // let yellowCardTexture = PIXI.Texture.fromImage(this.yellowCardTexture);
        let yellowCard = Sprite.from(this.yellowCardTexture);
        yellowCard.x = this.card_x + this.card_width * 0.5;
        yellowCard.y = this.card_y + this.card_height * 1.2;
        yellowCard.width = this.card_width / 5;
        yellowCard.scale.y = yellowCard.scale.x;
        yellowCard.alpha = 1;
        yellowCard.anchor.set(1, 0);
        yellowCard.visible = true;
        this.addChild(yellowCard);
        this.selectable = true;

        if (count === 5) {
            this.yellowCard.visible = true;
            // this.selectable = false;
        }
        else if (hasRedCard) {
            this.yellowCard.texture = Texture.from("red_card");
            this.yellowCard.visible = true;
            // this.selectable = false;
        }
        else if (injuredFor_n_games !== 0) {
            this.injury.visible = true;
            // this.selectable = false;
            const textStyle = new TextStyle({
                fontFamily: config.mainFont,
                fill: "ffffff",
                align: 'center'
            });
            createText(`${injuredFor_n_games}`, textStyle, this, this.card_y + this.card_height / 2, this.card_x + this.card_width / 2, 0.5, 0.5, App.height / 50);
        }
    }

    addGoalsScored(x: number) {
        let ball = Sprite.from("ball_prototype");
        ball.x = x;
        ball.y = this.card_y + this.card_height * 1.02;
        ball.width = this.card_width / 5;
        ball.scale.y = ball.scale.x;
        ball.alpha = 1;
        ball.anchor.set(1, 0);
        this.addChild(ball);
    }

    private calculatePlayerStars(totalPower: number): number {
        let finalPower;

        if (totalPower <= 25) {
            finalPower = 7;
        }
        else if (totalPower === 26 || totalPower === 27) {
            finalPower = 6;
        }
        else if (totalPower === 28 || totalPower === 29) {
            finalPower = 5;
        }
        else if (totalPower === 30 || totalPower === 31) {
            finalPower = 4;
        }
        else if (totalPower === 32 || totalPower === 33) {
            finalPower = 3;
        }
        else if (totalPower === 34 || totalPower === 35) {
            finalPower = 2;
        }
        else if (totalPower > 35 && totalPower < 100) {
            finalPower = 1;
        } else {
            finalPower = 0;
        }
        return finalPower;
    }
}

export interface IColors {
    [key: string]: string;
}

