import { App } from "../../App";
import { recordClubPlayersParams } from "../../recordClubPlayersParams";
import { Level } from "../Level";
import Grid from "../../game_level/Grid";
export default class WSConnection {

    static grid: any;
    static opponentID: any;
    constructor() { }

    static PVP_gridCreated(grid: any) {

        console.log(grid);

        App.ws.send(JSON.stringify({
            grid: grid,
            opponentID: this.opponentID
        }));
    }

    static startWS() {

        let HOST = "https://football-match3-api.herokuapp.com/".replace(/^http/, 'ws');// for prod -
        // let HOST = 'ws://localhost:9000/';//  localhost -

        App.ws = new WebSocket(HOST);

        App.ws.onopen = (e) => {
            console.log("WS connection succesfully opened");
            App.ws.send(JSON.stringify({
                user: {
                    user: App.user,
                    team: App.playerClubData.name,
                    selectedSlot: -1,
                    readyConfirmed: false,
                    isHome: false
                }
            }));
        };

        App.ws.onerror = (err) => {
            console.log(err)
        };

        App.ws.onmessage = async (rawMessage) => {
            // console.log(rawMessage);
            await rawMessage.data.text().then((msg: any) => {

                let message = JSON.parse(msg);
                let users = message.users;
                let newGame = message.newGame;
                let grid = message.grid;

                if (users) {
                    console.log("users " + users);

                    App.EE.emit("pvp_updateRoom", {
                        selected: Object.values(users).map((u: any) => u.selectedSlot),
                        users: users
                    });
                }
                else if (newGame) {
                    const IDs = newGame.id.split("/");
                    this.opponentID = newGame.isHome ? IDs[1] : IDs[0];
                    App.EE.emit("pvp_startGame", newGame);
                }
                else if (grid) {
                    console.log(grid);
                    alert("TODO - inject grid into away team");//(this teeam)
                }
            })
        };
    }
}
