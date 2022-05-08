
import { App } from "../App";
import { Card } from "./Card";
import * as grid_interfaces from "./grid_interfaces"

export function smartMove(possibleMoves: grid_interfaces.IPossibleMoves[]) {

    let level = App.app.stage.getChildByName("level") as any;

    let goalScoringMoves: any = [];
    let goalStopingIndexes = [];
    let defenceCreatingMoves: any = [];

    let isLeading;
    let ownPlayers: any;
    let opponentPlayers: any;

    ///NOTE - here App.isPlayerTurn has not switched yet so we use !App.isPlayerTurn
    switch (!App.isPlayerTurn) {
        case true:
            isLeading = level.playerScore > level.opponentScore;
            ownPlayers = level.playerCards.children;
            opponentPlayers = level.opponentCards.children;
            break;
        case false:
            isLeading = level.opponentScore > level.playerScore;
            opponentPlayers = level.playerCards.children;
            ownPlayers = level.opponentCards.children;
            break;
        default:
            break;
    }

    let colors: any = {
        'FF1D00': "ball_red",     // RED:
        '3052FF': "ball_blue",    // BLUE:
        '2F7F07': "ball_green",   // GREEN:
        'E2D841': "ball_yellow",  // YELLOW:
        'B200FF': "ball_purple"   // PURPLE:
    }

    /**
     * moves that can lead to scoring goal
     */
    let checkPossibleGoals = () => {
        // indexes of possibleMoves that can score goal
        possibleMoves.forEach((move, index) => {
            let moveColors = move.types;
            ownPlayers.forEach((player: Card) => {
                let playerColor = colors[player.stats.attack_color];
                if (!moveColors.includes(playerColor)) {
                    return;
                }
                let currentAttackPoints = player.stats.attack_current;
                let attackPointsNeededToScore = player.stats.attack_full;
                let matches = move.colors[playerColor];

                if (currentAttackPoints + matches >= attackPointsNeededToScore) {
                    console.log(`goalScoringMove => ${move}`);
                    goalScoringMoves.push(move);
                }
            });
        });
    }

    /**
     * moves that can lead to creating defence
     */
    let checkPossibleDefence = () => {
        // indexes of possibleMoves that can create defence
        possibleMoves.forEach((move, index) => {
            let moveColors = move.types;
            ownPlayers.forEach((player: any) => {
                let playerColor = colors[player.stats.defense_color];
                if (!moveColors.includes(playerColor)) {
                    return;
                }
                let currentDefensePoints = player.stats.defense_current;
                let defensePointsNeededToScore = player.stats.defense_full;
                let matches = move.colors[playerColor];

                if (currentDefensePoints + matches >= defensePointsNeededToScore) {
                    console.log(`defenceCreatingMove => ${move}`);
                    defenceCreatingMoves.push(move);
                }
            });
        });
    }

    checkPossibleGoals();
    checkPossibleDefence();
    // checkStopGoal(); //TODO - do not call it if it;s last round and opponent has no more moves!!!!

    if (goalScoringMoves.length > 0) {
        let bestMatches = goalScoringMoves.filter((f: { matches: number; }) => f.matches === Math.max(...goalScoringMoves.map((m: { matches: any; }) => m.matches)));
        return bestMatches[Math.floor(Math.random() * bestMatches.length)];
    }

    if (defenceCreatingMoves.length > 0) {
        let bestMatches = defenceCreatingMoves.filter((f: { matches: number; }) => f.matches === Math.max(...defenceCreatingMoves.map((m: { matches: any; }) => m.matches)));
        return bestMatches[Math.floor(Math.random() * bestMatches.length)];
    }

    let bestMatches = possibleMoves.filter(f => f.matches === Math.max(...possibleMoves.map(m => m.matches)));
    return bestMatches[Math.floor(Math.random() * bestMatches.length)];
}
