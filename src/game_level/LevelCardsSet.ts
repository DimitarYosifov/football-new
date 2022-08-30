
import { Container } from "pixi.js";
import { App } from "../App";
import { config } from "../configs/MainGameConfig";
import { Card } from "./Card";
import LineUps from "./LineUps";

export default class LevelCardsSet extends Container {

    private targetDeck: string;
    private clubName: string;
    private lineUps: ILineUp;
    private randomColor: boolean;

    constructor(targetDeck: string, clubName: string) {
        super();
        this.targetDeck = targetDeck;
        this.clubName = clubName;
        this.lineUps = new LineUps(this.clubName, this.onCardsData, this.targetDeck);
        console.log(this.lineUps);
        this.randomColor = App.pvpGame ? false : config.randomCardColors;
        this.interactive = false;
    }

    private createPlayerDeck() {
        for (let i = 0; i < 6; i++) {
            let card_x = (App.width / 6) * i;
            let card_y = App.height * 0.88;
            let card_width = App.width / 6;
            let card_height = App.height * 0.12;
            let card = new Card({
                index: i,
                stats: this.lineUps.player![i],
                font_size: App.height / 45,  //change this shit!!

                cardTexture: `player_id_${this.lineUps.player![i].player_img_id}`,
                card_x: card_x,
                card_y: card_y,
                card_width: card_width,
                card_height: card_height,

                shoeTexture: `shoe`,
                shoe_x: card_x,
                shoe_y: card_y + card_height * 0.02,
                shoe_height: card_height * 0.23,

                attack_text: {
                    x: card_x + card_width,
                    y: card_y
                },

                gloveTexture: `glove2`,
                glove_x: card_x,
                glove_y: card_y + card_height * 0.7,
                glove_height: card_width * 0.35,

                defense_text: {
                    x: card_x + card_width,
                    y: card_y + card_height * 0.76
                },

                yellowCardTexture: `yellow_card`,
                yellowCard_x: card_x + card_width / 2,
                yellowCard_y: card_y + card_height / 2,
                yellowCard_width: card_width * 0.75,

                injuryTexture: `red_cross`,
                injury_x: card_x + card_width / 2,
                injury_y: card_y + card_height / 2,
                injury_width: card_width * 0.75,

                //TODO - come up with something better here!
                //this is unused
                border_x: card_x + card_width,
                border_y: card_y,
                border_width: 0,
                border_height: card_height,

                starsTexture: `star`,
                stars_x: card_x + card_width / 2,
                stars_y: card_y,
                stars_width: card_width * 0.12,

                totalPower: this.lineUps.player![i].defense_full + this.lineUps.player![i].attack_full
            }, false, this.randomColor)
            this.addChild(card);
        }
    }

    private createOpponentDeck() {
        for (let i = 0; i < 6; i++) {
            let card_x = (App.width / 6) * i;
            let card_y = App.height * 0.88;
            let card_width = App.width / 6;
            let card_height = App.height * 0.12;
            let card = new Card({
                index: i,
                stats: this.lineUps.opponent![i],
                font_size: App.height / 45,  //idiotic!!!! TODO...

                cardTexture: `player_id_${this.lineUps.opponent![i].player_img_id}`,
                card_x: card_x,
                card_y: 0,
                card_width: card_width,
                card_height: card_height,

                shoeTexture: `shoe`,
                shoe_x: card_x,
                shoe_y: card_height * 0.02,
                shoe_height: card_height * 0.23,

                attack_text: {
                    x: card_x + card_width,
                    y: 0
                },

                gloveTexture: `glove2`,
                glove_x: card_x,
                glove_y: card_height * 0.7,
                glove_height: card_width * 0.35,

                defense_text: {
                    x: card_x + card_width,
                    y: card_height * 0.76
                },

                yellowCardTexture: `yellow_card`,
                yellowCard_x: card_x + card_width / 2,
                yellowCard_y: card_height / 2,
                yellowCard_width: card_width * 0.75,

                injuryTexture: `red_cross`,
                injury_x: card_x + card_width / 2,
                injury_y: card_height / 2,
                injury_width: card_width * 0.75,

                // unused!!!
                border_x: (App.width / 6) * i,
                border_y: App.height * 0,
                border_width: 0,
                border_height: 0,

                starsTexture: `star`,
                stars_x: card_x + card_width / 2,
                stars_y: card_height + card_width * 0.12,
                stars_width: card_width * 0.12,

                totalPower: this.lineUps.opponent![i].defense_full + this.lineUps.opponent![i].attack_full
            }, false, this.randomColor)
            this.addChild(card);
        }
    }

    onCardsData = () => {
        console.log(this.targetDeck);

        this.targetDeck === "player" ? this.createPlayerDeck() : this.createOpponentDeck();
    }
}

export interface ILineUp {
    clubData: Function;
    clubName: string;
    onCardsData: Function;
    targetDeck: string;
    player?: IPlayersStats[];
    opponent?: IPlayersStats[];
}

export interface IPlayersStats {
    EXP: number
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
