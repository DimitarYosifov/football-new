import { Container } from "pixi.js";
import { IScene } from "../App";

export default class PvPRoom extends Container implements IScene {

    constructor() {
        super();
        alert("PvP in progress");
        this.testWS();
    }

    update(framesPassed: number): void {
        framesPassed = framesPassed;
        // throw new Error("Method not implemented.");
    }
    addBG(): void {

    }

    public testWS() {
        // let HOST = location.origin.replace(/^http/, 'ws'); // for prod
        // or maybe
        let HOST = "https://football-match3-api.herokuapp.com/".replace(/^http/, 'ws');
        // let HOST = 'ws://localhost:3000/'; //for localhost

        let ws = new WebSocket(HOST);
        console.log(ws);
        ws.onopen = (e) => {
            console.log("WS connection succesfully opened");
            // ws.send(JSON.stringify({ user: userName }));
            // ws.send(JSON.stringify({}));
        };


        ws.onerror = (err) => {
            console.log(err)
        };

        ws.onmessage = async (message) => {
            console.log(message.data);
            return;

            await message.data.text().then((msg: any) => {

                console.log(msg);

                if (typeof JSON.parse(msg) === "object") {
                    //update users... - TODO - now we update all users, not adding the new one.  
                    // document.getElementById("users").innerHTML = '';
                    // const users = Object.keys(JSON.parse(msg));
                    // users.forEach(user => addNewUser(user));
                } else {
                    // let wholeMessage = JSON.parse(msg).split(": ");
                    // let user = wholeMessage[0];
                    // let _message = wholeMessage[1];
                    // addNewMessage(user, _message);
                }
            })
        };
    }
}
