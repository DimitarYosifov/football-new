import { config } from "./configs/MainGameConfig";
import { ServerRequest } from "./ServerRequest"
import { IScene, App } from "./App";
import { Level } from "./scenes/Level";

export async function recordClubPlayersParams(matchEnd: boolean, callBack: Function) {

    let team = App.playerClubData.name;
    let players;
    let initialParamsPlayers = App.allClubs.find((t: { name: string }) => t.name === team).players;
    let level = (App.app.stage.getChildByName("level") as any);

    if (matchEnd) {
        //TODO...
        // // players = initialParamsPlayers;
        // //app.level.children.find(child => child.clubName === team).lineUps.player;
        players = level.children.find((child: { clubName: string; }) => child.clubName === team).lineUps.player;
        for (let playerIdx = 0; playerIdx < 6; playerIdx++) {

            players[playerIdx].leagueYellowCards += level.playerCards.children[playerIdx].hasYellowCard;
            if (level.playerCards.children[playerIdx].hasRedCard) {
                players[playerIdx].leagueRedCards = true;
            }
            players[playerIdx].goalsScored += level.playerCards.children[playerIdx].goalsScored;
            if (level.playerCards.children[playerIdx].hasInjury && players[playerIdx].injured === 0) {
                players[playerIdx].injured = Math.floor(Math.random() * config.maxInjuryDuration) + 1;
            }

            players[playerIdx].attack_full -= App.opponentClubData.power;
            players[playerIdx].attack_current = 0;
            players[playerIdx].defense_full -= App.opponentClubData.power;
            players[playerIdx].defense_current = 0;

        }
        for (let playerIdx = 6; playerIdx < 18; playerIdx++) {
            if (players[playerIdx].injured > 0) {
                players[playerIdx].injured--;
            }
            if (players[playerIdx].leagueYellowCards === config.yellowCardsToMissGame) {
                players[playerIdx].leagueYellowCards = 0;
            }

            if (players[playerIdx].leagueRedCards) {
                players[playerIdx].leagueRedCards = false
            }
        }
    } else {
        players = initialParamsPlayers;
    }

    ServerRequest(
        "playersParams",
        JSON.stringify({
            players: players,
            user: localStorage.getItem('user')
        }),
        'POST',
    ).then((res: any) => { callBack(); })
}
