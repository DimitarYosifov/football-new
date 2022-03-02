import { RotatingButton } from "../buttons/RotatingButton";
import { IScene, App } from "../App";
import { Container, Sprite, Text } from "pixi.js";
import { config } from "../configs/MainGameConfig";
import gsap from "gsap";

export default class MostYellowCards extends Container implements IScene {

    private mostYellowCardsData: any;
    private playerClub: any;
    private players: IPlayerData[];
    private allYellowCards: IPlayerData[] = [];
    private containers: Container[] = [];
    private backgroundImg: Sprite;
    private header: Text;
    private finalData: any;
    private backBtn: RotatingButton;

    constructor() {
        super();
        this.mostYellowCardsData = App.mostYellowCards;
        this.playerClub = App.playerClubData.name;
        this.players = App.playerLineUp;
        this.containers = [];
        this.mostYellowCardsData[this.playerClub] = this.players.map(player => player.leagueYellowCards);
        Object.keys(this.mostYellowCardsData).forEach((team, index) => {
            console.log(team);
            for (let index = 0; index < this.mostYellowCardsData[team].length; index++) {
                let player = {} as IPlayerData;
                player.club = team;
                player.index = index;
                player.yellowCards = this.mostYellowCardsData[team][index];
                let players;
                if (this.playerClub === team) {
                    players = this.players;
                }
                else {
                    players = App.allClubs.find((c: { name: string; }) => c.name === team).players;
                }
                player.img = players[index].player_img_id;
                this.allYellowCards.push(player);
            }
        })
        this.finalData = this.allYellowCards.sort((a, b) => a.yellowCards - b.yellowCards).reverse().slice(0, 10);
        console.log(this.finalData);
        this.addBG();
        this.addHeader();
        this.addPlayers();
        this.addButtons();

    }

    public addBG(): void {
        this.backgroundImg = Sprite.from("yellowCardsBG");
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);
    }

    public update(framesPassed: number): void { }

    addHeader() {
        this.header = new Text("YELLOW CARDS", {
            fontFamily: config.mainFont,
            fontSize: App.height / 20,
            // fill: isPlayerClub ? "#6ddd48" : '#dbb7b7',
            fill: '#dbb7b7',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.header.position.set(App.width / 2, -200);
        this.header.anchor.set(0.5, 0);
        this.addChild(this.header);
        gsap.to(this.header, 0.3, {
            delay: 0.4,
            // ease: Back.easeOut,
            y: App.height * 0.03,
            onComplete: () => { }
        });
    }

    addPlayers() {
        this.finalData.forEach((el: any, idx: number) => {
            let cont = new Container();
            const data = el;
            let y = App.height * 0.1 + App.height * 0.08 * idx

            let index = new Text((idx + 1).toString(), {
                fontFamily: config.mainFont,
                fontSize: App.height / 25,
                fill: '#dbb7b7',
                // align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            });
            index.position.set(App.width * 0.05, y + App.height * 0.01);
            index.anchor.set(0.5, 0);
            cont.addChild(index);
            let img = Sprite.from(`player_id_${data.img}`);
            img.width = App.width / 15;
            img.scale.y = img.scale.x;
            img.position.set(App.width * 0.15, y);
            img.anchor.set(0, 0);
            cont.addChild(img);

            let team = new Text(data.club, {
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                // align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            });
            team.position.set(App.width * 0.4, y + App.height * 0.01);
            team.anchor.set(0, 0);
            cont.addChild(team);

            let yellowCards = new Text(data.yellowCards, {
                fontFamily: config.mainFont,
                fontSize: App.height / 25,
                fill: '#dbb7b7',
                // align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            });
            yellowCards.position.set(App.width * 0.75, y + App.height * 0.01);
            yellowCards.anchor.set(0, 0);
            cont.addChild(yellowCards);
            this.addChild(cont);
            this.containers.push(cont);
            cont.x -= App.width;
            console.log(cont.y);
            gsap.to(cont, 0.1, {
                delay: idx * 0.06,
                x: 0, onComplete: () => { }
            });
        });
    }

    addButtons() {
        //--BACK BUTTON
        let backOnPointerDown = () => {
            let counter = 0;
            for (let idx = this.containers.length - 1; idx >= 0; idx--) {
                gsap.to(this.containers[idx], 0.35, {
                    delay: counter * 0.06,
                    x: -App.width,
                    onStart: () => {
                        console.log(counter);
                    }
                });
                counter++;
            }
            gsap.to([this.backBtn.finalTexture, this.backBtn.label], 0.35, {
                x: App.width * 1.1,
                ease: "Back.easeIn",
                onComplete: () => { }
            });
            gsap.to(this.header, 0.35, {
                y: -200,
                onComplete: () => { }
            });
            gsap.delayedCall(1, () => {
                gsap.delayedCall(0.01, () => {
                    App.app.stage.removeChild(this);
                    App.fade(0, 1).then(() => {
                    });
                })
            })
        }
        this.backBtn = new RotatingButton("", "", backOnPointerDown);
        this.addChild(this.backBtn.finalTexture);
        this.backBtn.setButtonSize(App.height * 0.1, App.width * 1.1, App.height * 0.1);
        this.backBtn.addLabel(`Back`, 0.4);

        gsap.to([this.backBtn.finalTexture, this.backBtn.label], 0.3, {
            delay: 0.3,
            ease: "Back.easeOut",
            x: App.width * 0.9,
            onComplete: () => { }
        });
    }
}

export interface IPlayerData {
    club: string,
    index: number,
    yellowCards: number,
    leagueYellowCards: number,
    img: string
}
