import { Container, Sprite, TextStyle } from "pixi.js";
import { App, IScene } from "../../App";
import { config } from "../../configs/MainGameConfig";
import { createText } from "../../createText";
import { Level } from "../Level";
import EmptySlot from "./EmptySlot";
import gsap from "gsap";
import { recordClubPlayersParams } from "../../recordClubPlayersParams";
import Grid from "../../game_level/Grid";
import WSConnection from "./WSConnection";

export default class PvPRoom extends Container implements IScene {

    private playersOnlineContainer: Container = new Container();
    private slotsContainer: Container = new Container();
    private slots: EmptySlot[] = [];
    private users: any;

    constructor() {
        super();
        WSConnection.startWS();
        this.createHeader();
        this.addChild(this.playersOnlineContainer);
        this.addChild(this.slotsContainer);
        this.createSlots();
        this.slotsContainer.position.set(0, App.height * 0.35);

        App.EE.on("pvp_updateRoom", (data) => {
             console.log(data);
            this.users = data.users;
            this.updatePlayersList();
            this.updateSlots(data.selected);

        });
        App.EE.on("pvp_startGame", this.startGame);
    }
    private startGame(newGame: any) {
        App.opponentClubData = App.allClubs.filter((c: any) => {
            return c.clubData.name === newGame.opponent
        })[0].clubData;
        App.isPlayerHome = newGame.isHome;
        recordClubPlayersParams(false, () => {
            App.removeScene(this);
            App.setScene(new Level());
            gsap.delayedCall(0.01, () => {
                App.fade(0, 1).then(() => { });
            })
        });
    }

    private createSlots() {
        const totalSlots = 4;
        for (let index = 0; index < totalSlots; index++) {
            const rowContainer = new Container();

            let frame1 = new EmptySlot(0, 0, 0, 0, index * 2);
            this.slots.push(frame1);
            let frame2 = new EmptySlot(App.width * 0.9, 0, 1, 0, index * 2 + 1);
            this.slots.push(frame2);

            const style = new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });

            rowContainer.addChild(frame1);
            rowContainer.addChild(frame2);

            createText("VS", style, rowContainer, rowContainer.height / 2, rowContainer.width / 2, 0.5, 0.5, App.height / 30);

            this.slotsContainer.addChild(rowContainer);
            rowContainer.position.set(App.width * 0.1, this.slotsContainer.height + 15);
        }
    }

    public update(framesPassed: number): void {
        framesPassed = framesPassed;
    }

    public addBG(): void { };

    private updateSlots(selected: any) {
        this.slots.forEach((slot, index) => {
            console.log(this.slots[0].children.length);
            if (selected.includes(index)) {
                let slotData: any;
                let user: any;
                Object.keys(this.users).filter((key) => {
                    console.log(this.users[key]);
                    if (this.users[key].selectedSlot === index) {
                        slotData = this.users[key];
                        user = key;
                    }
                });
                if (!slot.logo && !slot.player) {
                    slot.setEnabled(false);
                    slot.setSelected(user, slotData.team);
                };
            }
            else {
                slot.setEnabled(true);
                slot.setEmpty();
            }
        });
    }

    private updatePlayersList(): void {
        this.playersOnlineContainer.removeChildren();
        this.createHeader();
        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        for (let index = 0; index < Object.keys(this.users).length; index++) {
            const name = Object.keys(this.users)[index];
            const team: any = Object.values(this.users)[index];
            console.log(name, team);
            const y = this.playersOnlineContainer.height;
            let logo = this.addLogo(team, 0, y, App.height / 25, 0, 0);
            this.playersOnlineContainer.addChild(logo);
            createText(`${name}`, getStyle(), this.playersOnlineContainer, y, logo.width * 1.5, 0, 0, App.height / 30);
        }
    }

    private createHeader() {
        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                // stroke: '#000000',
                // strokeThickness: 3,
                // fontWeight: "400"
            });
        }
        let header = createText("players online:", getStyle(), this.playersOnlineContainer, 0, 0, 0, 0, App.height / 30);
        this.playersOnlineContainer.x = App.width * 0.5 - this.playersOnlineContainer.width / 2;
        this.playersOnlineContainer.y = App.height * 0.05;
    }

    private addLogo = (data: any, x: number, y: number, height: number, anchorX: number, anchorY: number) => {
        let logo = App.allClubs.filter((club: { name: string; }) => club.name === data.team)[0].clubData.logo;
        let clubLogo = Sprite.from(`${logo}`);
        clubLogo.height = height;
        clubLogo.x = x;
        clubLogo.y = y;
        clubLogo.scale.x = clubLogo.scale.y;
        clubLogo.anchor.set(anchorX, anchorY);
        return clubLogo;
    }
}
