import { Container, Sprite, TextStyle } from "pixi.js";
import { App, IScene } from "../App";
import { config } from "../configs/MainGameConfig";
import { createText } from "../createText";

export default class PvPRoom extends Container implements IScene {

    private playersOnlineContainer: Container = new Container();

    constructor() {
        super();
        this.startWS();
        this.createHeader();
        this.addChild(this.playersOnlineContainer);
    }

    public update(framesPassed: number): void {
        framesPassed = framesPassed;
    }
    public addBG(): void { };

    public startWS() {
        //TODO - check process env here
        let HOST = "https://football-match3-api.herokuapp.com/".replace(/^http/, 'ws');// for prod -
        // let HOST = 'ws://localhost:8000/';//  localhost -

        let ws = new WebSocket(HOST);
        console.log(ws);
        ws.onopen = (e) => {
            console.log("WS connection succesfully opened");
            ws.send(JSON.stringify({ user: App.user, team: App.playerClubData.name }));
        };

        ws.onerror = (err) => {
            console.log(err)
        };

        ws.onmessage = async (rowMessage) => {
            await rowMessage.data.text().then((msg: any) => {
                let message = JSON.parse(msg);
                let users = message.users;
                console.log(users);
                if (users) {
                    // this.playersOnlineContainer.removeChildren();
                    this.updatePlayersList(users);
                } else {
                    // let wholeMessage = JSON.parse(msg).split(": ");
                    // let user = wholeMessage[0];
                    // let _message = wholeMessage[1];
                    // addNewMessage(user, _message);
                }
            })
        };
    }
    private updatePlayersList(users: {}): void {
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

        for (let index = 0; index < Object.keys(users).length; index++) {
            const name = Object.keys(users)[index];
            const team: any = Object.values(users)[index];
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
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }
        let header = createText("players online:", getStyle(), this.playersOnlineContainer, 0, 0, 0, 0, App.height / 30);
        this.playersOnlineContainer.x = App.width * 0.95 - this.playersOnlineContainer.width;
        this.playersOnlineContainer.y = App.height * 0.1;
    }

    private addLogo = (clubName: string, x: number, y: number, height: number, anchorX: number, anchorY: number) => {
        let logo = App.allClubs.filter((club: { name: string; }) => club.name === clubName)[0].clubData.logo;
        let clubLogo = Sprite.from(`${logo}`);
        clubLogo.height = height;
        clubLogo.x = x;
        clubLogo.y = y;
        clubLogo.scale.x = clubLogo.scale.y;
        clubLogo.anchor.set(anchorX, anchorY);
        return clubLogo;
    }
}
