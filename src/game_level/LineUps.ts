import { ServerRequest } from "../ServerRequest";
import { config } from "../configs/MainGameConfig";
import { App } from "../App";

export default class LineUps {

    public clubName: string;
    public targetDeck: string;
    public onCardsData: Function;

    constructor(clubName: string, onCardsData: Function, targetDeck: string) {
        this.clubName = clubName;
        this.onCardsData = onCardsData;
        this.targetDeck = targetDeck;
        this.clubData();
    }

    public clubData = () => {

        console.log(App.user);
        console.log(this.targetDeck);

        if (this.targetDeck === "player" && !App.friendly) {
            console.log(`ìts INSIDE!!!!!!!!!!!!!!!`);

            ServerRequest(
                "getPlayerLineUp",
                JSON.stringify({ user: App.user }),
                "POST"
            ).then((res: any) => {
                (this as any)[this.targetDeck] = res.players;  //TODO - fix this any here

                console.log(33333);


                this.onCardsData();
            }).catch((err) => {
                console.error('err', err)
            });
        } else {
            console.log(this.targetDeck);

            ServerRequest(
                "getClubsPlayers",
                JSON.stringify({ name: this.clubName }),
                "POST"
            ).then((res: any) => {
                (this as any)[this.targetDeck] = res.clubData.players; //TODO - fix this any here

                console.log(44444);


                this.onCardsData();
            }).catch((err) => {
                console.error('err', err)
            });
        }
    }
}
