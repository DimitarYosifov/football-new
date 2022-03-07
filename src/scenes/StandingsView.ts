import BangUp from "../BangUp";
import { ServerRequest } from "../ServerRequest"
import { IScene, App, ITeamData, ITopScorers, IPlayerLineUp } from "../App";
import { Container, Sprite, Graphics, Loader, Text, TextStyle, Texture, ParticleContainer } from "pixi.js";
import { RotatingButton } from "../buttons/RotatingButton";
import { config } from "../configs/MainGameConfig";
import { ballParticleConfig } from "../configs/ParticleConfigs/ballParticleConfig";
import { Emitter, EmitterConfig } from "pixi-particles";
import { AnimatedSprite } from "pixi.js";
import { GenerateResult } from "../GenerateResult";
import gsap from "gsap";
import MostYellowCards from "./MostYellowCards";
import TopScorers from "./TopScorers";
import { EditTeam } from "./EditTeam";
import { Level } from "./Level";

export class StandingsView extends Container implements IScene {
    private fixturesHeader: Text;
    private fixturesContainer: Container = new Container;
    private moneySectionContainer: Container = new Container;
    private lastRoundGoals: any = {}; //TODO  interface!!!!
    private backgroundImg: Sprite;
    private prev: Sprite;
    private next: Sprite;
    private cashText: Text;
    private moneySectionBG: Sprite;
    private selectedRound: number;
    private increaseRound: boolean;
    private currentRound: number = 0;
    private continueBtn: RotatingButton;
    private editTeameBtn: RotatingButton;
    private topScorerBtn: RotatingButton;
    private mostYellowCardsBtn: RotatingButton;
    private lastGameRersult: string;
    private shouldGenerateResults: boolean;
    private emitters: Emitter[] = [];
    private coin: AnimatedSprite;

    constructor(increaseRound: boolean = false, lastGameRersult: string = "", shouldGenerateResults: boolean = false) {
        super();
        // if (!this.topScorers && this.data) this.topScorers = this.data.topScorers;
        // if (!this.mostYellowCards && this.data) this.mostYellowCards = this.data.mostYellowCards;
        // if (this.playerCash === undefined && this.data) this.playerCash = this.data.playerCash;
        this.addBG();
        const loadingWrapper = document.getElementById("loading-wrapper");
        if (loadingWrapper) { loadingWrapper.remove() };
        this.increaseRound = increaseRound;
        increaseRound ? this.currentRound++ : null;
        this.lastGameRersult = lastGameRersult;
        this.shouldGenerateResults = shouldGenerateResults;

        this.getPLayerLineUp();
        this.getClubsData();
        gsap.delayedCall(1, () => { this.ballParticle("add") });
    }

    public update(time: number): void {
        this.emitters.forEach((emitter) => {
            if (emitter.parent) {
                emitter.update((time * 0.01))
            }
        });
     }

    public addBG(): void {
        this.backgroundImg = Sprite.from("bg33");
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);
        this.backgroundImg.alpha = 0.5;
    }

    private deleteProgress() {
        ServerRequest(
            "deleteProgress",
            JSON.stringify({ user: App.user })
        ).then((res) => { console.log("progress deleted successfully") });
    }

    private checkContinueAllowed = () => {
        const continueDisabled = App.playerLineUp
            .slice(0, 6)
            .find(el => el.leagueRedCards || el.leagueYellowCards === 5 || el.injured > 0);
        if (continueDisabled) {
            this.continueBtn.interactive = false;
            this.continueBtn.alpha = 0.4;
        } else {
            this.continueBtn.interactive = true;
            this.continueBtn.alpha = 1;
        }
    }

    private getClubsData() {
        // TODO - CHECK IF allClubs EXIST IN APP, IF SO CANCEL THIS REQUEST
        if (App.seasonFixtures && App.playerClubData) {
            //TODO
        } else {
            ServerRequest("getAllClubsData").then((res) => {
                App.allClubs = (res as any).clubs;
                App.allClubNames = App.allClubs.map((club: { name: any; }) => club.name);
                if (!App.seasonFixtures) {
                    App.teams = [];
                    App.topScorers = {} as ITopScorers;
                    App.mostYellowCards = {};
                    App.allClubNames.forEach((club: string, clubIdx: any) => {
                        let team = {} as ITeamData;
                        team.name = club;
                        team.won = 0;
                        team.ties = 0;
                        team.lost = 0;
                        team.goalsFor = 0;
                        team.goalsAgainst = 0;
                        team.goalsDifference = "0";
                        team.points = 0;


                        App.teams.push(team);
                        App.topScorers[club] = [0, 0, 0, 0, 0, 0];
                        App.mostYellowCards[club] = [0, 0, 0, 0, 0, 0];
                        App.playerCash = 0;
                    })
                    this.currentRound = 1;
                    App.createSeasonFixtures();
                    this.addMoneySection();
                }
                else {
                    this.addMoneySection();
                }
                this.createFixtures();
                if (this.selectedRound !== 1 && this.increaseRound) this.selectedRound--;
            });
        }
    }


    private addButtons() {
        //---CONTIONUE BUTTON
        let continueOnPointerDown = () => {
            if (
                !App.seasonFixtures[this.currentRound] && this.lastGameRersult

            ) {
                /*
                    ONE HELL OF A TODO - HANDLE END OF SEASON IN A NORMAL SENSE VISUALLY
                    instead of an alert !!!!!!!!!!!!
                */
                this.deleteProgress();
                alert("You have reached the end of the season.Thank you for playing :)");
                location.reload();
            }
            else if (this.selectedRound === 1 && this.currentRound === 1) {//this is lame but works
                this.getNextOpponent();
                this.ballParticle("");
                App.removeScene(this);
                App.setScene(new Level());
                gsap.delayedCall(0.01, () => {
                    App.fade(0, 1).then(() => { });
                })
            }
            else if (this.selectedRound !== this.currentRound || (this.selectedRound === 2 && this.currentRound === 1)) {
                this.increaseRound = false;
                this.lastGameRersult = '';
                this.shouldGenerateResults = false;
                // this.scrollToCurrentRound(0, this.selectedRound);//!!!!!!!!BUG HERE - TODO!
                this.scrollToCurrentRound(0, this.selectedRound === this.currentRound);
            }
            else {
                this.getNextOpponent();
                this.ballParticle("");
                App.removeScene(this); 
                App.setScene(new Level());
                gsap.delayedCall(0.01, () => {
                    App.fade(0, 1).then(() => { });
                })
            }
        }

        this.continueBtn = new RotatingButton("", "", continueOnPointerDown);
        this.continueBtn.setButtonSize(App.height * 0.2, App.width / 2, App.height * 0.87);
        this.addChild(this.continueBtn.finalTexture);
        this.continueBtn.addLabel(`Continue`, 0.24);

        //-----EDIT TEAM BTN
        let editTeamOnPointerDown = () => {
            App.setScene(new EditTeam());
        }

        this.editTeameBtn = new RotatingButton("", "", editTeamOnPointerDown);
        this.addChild(this.editTeameBtn.finalTexture);
        this.editTeameBtn.setButtonSize(App.height * 0.15, App.width * 0.84, App.height * 0.89);
        this.editTeameBtn.addLabel(`Edit\nTeam`, 0.24);

        //-----TOP SCORERS BTN
        let topScorersOnPointerDown = () => {
            App.setScene(new TopScorers());
        }

        this.topScorerBtn = new RotatingButton("", "", topScorersOnPointerDown);
        this.addChild(this.topScorerBtn.finalTexture);
        this.topScorerBtn.setButtonSize(App.height * 0.10, App.width * 0.16, App.height * 0.91);
        this.topScorerBtn.addLabel(`Top\nScorers`, 0.24);

        //-----MOST YELLOW CARDS BTN
        let mostYellowCardsOnPointerDown = () => {
            App.setScene(new MostYellowCards());
        }

        this.mostYellowCardsBtn = new RotatingButton("", "", mostYellowCardsOnPointerDown);
        this.addChild(this.mostYellowCardsBtn.finalTexture);
        this.mostYellowCardsBtn.setButtonSize(App.height * 0.10, App.width * 0.16, App.height * 0.81);
        this.mostYellowCardsBtn.addLabel(`Yellow\nCards`, 0.24);
    }

    private getPLayerLineUp() {
        ServerRequest(
            "getPlayerLineUp",
            JSON.stringify({ user: App.user }),
            "POST"
        ).then((res: any) => {
            (App.playerLineUp as IPlayerLineUp[]) = res.players;
            this.addButtons();
            this.checkContinueAllowed();
        });
    }

    private createText = (_text: string, x: number, y: number, anchorX: number = 0.5, isPlayerClub?: boolean) => {
        let text = new Text(_text, {
            fontFamily: config.mainFont,
            fontSize: this.height / 50,
            fill: isPlayerClub ? "#6ddd48" : '#dbb7b7',
            align: 'center'
        });
        text.position.set(x, y);
        text.anchor.set(anchorX, 0);
        return text;
    }

    private createStandings = () => {
        let standingsContainer = new Container;
        let positionsX: IPositionsX = {
            name: App.width * 0.08,
            won: App.width * 0.35,
            ties: App.width * 0.43,
            lost: App.width * 0.52,
            goalsFor: App.width * 0.64,
            goalsAgainst: App.width * 0.73,
            goalsDifference: App.width * 0.83,
            points: App.width * 0.93
        }
        let headersPositionsX: IHeadersPositionsX = {
            club: App.width * 0.08,
            W: App.width * 0.35,
            T: App.width * 0.43,
            L: App.width * 0.52,
            GF: App.width * 0.64,
            GA: App.width * 0.73,
            GD: App.width * 0.83,
            P: App.width * 0.93
        }

        let separatorsPositionsX = {
            club: 0.05,
            W: App.width * 0.28,
            T: App.width * 0.36,
            L: App.width * 0.445,
            GF: App.width * 0.565,
            GA: App.width * 0.655,
            GD: App.width * 0.75,
            P: App.width * 0.85
        }

        let createSeparator = (x: number, y: number, width: number, height: number) => {
            let separator = new Graphics();
            separator.lineStyle(1, 0xdbb7b7, 1);
            separator.drawRect(x, y, width, height);
            return separator;
        }

        const comparingFunction = (club1: ITeamData, club2: ITeamData): number => {
            if (club1.points < club2.points) {
                return 1;
            }
            if (club1.points > club2.points) {
                return -1;
            }

            if (club1.points == club2.points) {
                if (club1.goalsDifference < club2.goalsDifference) {
                    return 1;
                }
                if (club1.goalsDifference > club2.goalsDifference) {
                    return -1;
                }
                return 0;
            }
            return 1; //this is bug!
        };

        App.teams.sort(comparingFunction);

        let createHeaders = () => {
            let row = new Container;
            let y = 0;
            row.addChild(this.createText("#", this.width * 0.03, y)); //this is position of the club
            Object.keys(headersPositionsX).forEach((prop, index) => {
                let isName = prop === "club";
                let anchorX = isName ? 0 : 0.5;
                row.addChild(this.createText(prop, headersPositionsX[prop], y, anchorX));
            });
            standingsContainer.addChild(row);
        }
        createHeaders();

        App.teams.forEach((club, i) => {
            let row = new Container;
            let y = standingsContainer.height;
            row.addChild(this.createText((i + 1).toString(), App.width * 0.02, y, undefined, club.name === App.playerClubData.name)); //this is position of the club
            Object.keys(club).forEach((prop, index) => {
                let isName = prop === "name";
                let anchorX = isName ? 0 : 0.5;
                let text = club[prop as keyof ITeamData].toString();
                let pos = positionsX[prop];
                row.addChild(this.createText(text, pos, y, anchorX, club.name === App.playerClubData.name));
            });
            standingsContainer.addChild(row);
            standingsContainer.addChild(createSeparator(
                this.width * 0.02,
                y + row.height,
                row.width * 0.75,
                this.height * 0.00001
            ));
        });

        standingsContainer.y = this.height * 0.65 - standingsContainer.height / 2;

        // Object.keys(headersPositionsX).forEach((prop, index) => {
        //     let separator = createSeparator(
        //         (separatorsPositionsX as any)[prop],
        //         0,
        //         this.width * 0.00001,
        //         standingsContainer.height
        //     )
        //     standingsContainer.addChild(separator);
        // });

        this.addChild(standingsContainer);
    }

    private recordFixtures() {
        ServerRequest(
            "fixtures",
            JSON.stringify({
                seasonFixtures: App.seasonFixtures,
                user: App.user,
                currentRound: this.currentRound,
                playerClubData: App.playerClubData,
                teams: App.teams,
                topScorers: App.topScorers,
                mostYellowCards: App.mostYellowCards,
                playerCash: App.playerCash
            }),
            "POST"
        ).then((res) => { });
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

    private scrollToCurrentRound = (delay: number, additionalScroll: any = 0) => {
        this.prev.interactive = false;
        this.next.interactive = false;
        this.prev.alpha = 0.35;
        this.prev.alpha = 0.35;
        this.selectedRound = this.currentRound;
        if (additionalScroll) this.selectedRound++;
        let x = App.width * (this.currentRound - 1 + additionalScroll) * -1;

        if (this.increaseRound) {
            x += App.width;
            delay = 0;
        }
        gsap.to(this.fixturesContainer, 0.75,
            {
                delay: delay,
                // ease: Back.easeIn,
                x: x,
                onStart: () => { },
                onComplete: () => {
                    if (this.selectedRound !== 1) {
                        this.prev.interactive = true;
                        this.prev.alpha = 1;
                    }
                    this.next.interactive = true;
                    this.next.alpha = 1;
                    this.prev.interactive = this.selectedRound !== 1;
                    this.next.interactive = this.selectedRound !== App.leagueRounds;
                }
            }
        );
    }

    private displayFixtures() {

        let playerClub = App.playerClubData.name;
        console.log(App.seasonFixtures);

        App.leagueRounds = Array.isArray(App.seasonFixtures) ? App.seasonFixtures.length - 1 : [null, ...Object.values(App.seasonFixtures)].length - 1;
        for (let round = 1; round <= App.leagueRounds; round++) {
            //Header
            let _y = this.height * 0.2;
            this.fixturesHeader = this.createText(
                `Round ${round}`,
                this.width / 2 + this.width * (round - 1),
                0,
                0.5,
                false
            );
            this.fixturesHeader.style.fontSize = this.height / 30;
            this.fixturesContainer.addChild(this.fixturesHeader);


            App.seasonFixtures[round].forEach((game: any, i: number) => {
                let splitGame = game.split(' ')[0];
                let firstClub = splitGame.split(":")[0];
                let secondClub = splitGame.split(":")[1];

                // if (firstClub === playerClub && round === this.currentRound) {
                //     this.opponentClubData = this.allClubs.find(c => c.name === secondClub).clubData;
                //     this.isPlayerHome = true;
                // } else if (secondClub === playerClub && round === this.currentRound) {
                //     this.opponentClubData = this.allClubs.find(c => c.name === firstClub).clubData;
                //     this.isPlayerHome = false;
                // }

                let row = new Container;
                let y = this.height * 0.1 + this.height * 0.05 * i

                let result;

                if (firstClub !== playerClub && secondClub !== playerClub) {
                    if (this.shouldGenerateResults && round === this.currentRound) {
                        result = this.randomResult(firstClub, secondClub, i);
                    } else {
                        result = App.seasonFixtures[round][i].split(" ")[1];
                    }
                } else {
                    if (this.lastGameRersult && round === this.currentRound) {
                        result = this.lastGameRersult;
                        if (firstClub !== playerClub) {
                            this.lastRoundGoals[firstClub] = result.split("-")[0];
                        } else {
                            this.lastRoundGoals[firstClub] = result.split("-")[1];
                        }
                        //this is dirty hack here to remove undefined...
                        App.seasonFixtures[round][i] = App.seasonFixtures[round][i].split(" ")[0];
                        App.seasonFixtures[round][i] += ` ${result}`;
                    } else {
                        result = App.seasonFixtures[round][i].split(" ")[1];
                    }
                    if (this.shouldGenerateResults && round === this.currentRound) {
                        this.calculatePoints(firstClub, secondClub, result)
                    }
                }

                let team1 = game.split(" ")[0].split(":")[0];
                let team2 = game.split(" ")[0].split(":")[1];

                //result text
                let _resultText = this.createText(
                    result,
                    this.width / 2 + (this.width * (round - 1)),
                    y,
                    0.5,
                    false
                );
                _resultText.style.fontSize = this.height / 30;
                row.addChild(_resultText);

                let logo1 = this.addLogo(firstClub, _resultText.x - _resultText.width, _resultText.y, _resultText.height * 1.25, 1, 0)
                row.addChild(logo1);

                //first club
                let _team1 = this.createText(
                    `${team1} `,
                    logo1.x - logo1.width,
                    y,
                    1,
                    false
                );
                _team1.style.fontSize = this.height / 30;
                row.addChild(_team1);


                let logo2 = this.addLogo(secondClub, _resultText.x + _resultText.width, _resultText.y, _resultText.height * 1.25, 0, 0)
                row.addChild(logo2);

                //second club
                let _team2 = this.createText(
                    ` ${team2}`,
                    logo2.x + logo2.width,
                    y,
                    0,
                    false
                );
                _team2.style.fontSize = this.height / 30;
                row.addChild(_team2);
                this.fixturesContainer.addChild(row);
            })
        }

        if (this.increaseRound) {
            this.generateRoundScorers();
            this.generateRoundYellowCards();
        }
        this.increaseRound ? this.currentRound++ : null;
        this.recordFixtures();

        this.fixturesContainer.y = this.height * 0.33 - this.fixturesContainer.height / 2;
        this.addChild(this.fixturesContainer);
        this.createStandings();
    }

    private randomResult = (firstClub: string, secondClub: string, i: number) => {
        let result = GenerateResult(
            App.allClubs.find((club: { name: string; }) => club.name === firstClub).clubData.power,
            App.allClubs.find((club: { name: string; }) => club.name === secondClub).clubData.power
        );
        this.lastRoundGoals[firstClub] = result.split("-")[0];
        this.lastRoundGoals[secondClub] = result.split("-")[1];

        App.seasonFixtures[this.currentRound][i] += ` ${result}`;
        this.calculatePoints(firstClub, secondClub, result);
        return result;
    }

    private calculatePoints = (firstClub: string, secondClub: string, result: string) => {
        let first = App.teams.find((t: { name: any; }) => t.name === firstClub) as ITeamData;
        first.won += +result.split('-')[0] > +result.split('-')[1] ? 1 : 0;
        first.ties += +result.split('-')[0] === +result.split('-')[1] ? 1 : 0;
        first.lost += +result.split('-')[0] < +result.split('-')[1] ? 1 : 0;
        first.goalsFor += +result.split('-')[0];
        first.goalsAgainst += +result.split('-')[1];
        first.goalsDifference = (first.goalsFor - first.goalsAgainst).toString();
        first.points = first.won * 3 + first.ties;

        let second = App.teams.find((t: { name: any; }) => t.name === secondClub) as ITeamData;
        second.won += +result.split('-')[0] < +result.split('-')[1] ? 1 : 0;
        second.ties += +result.split('-')[0] === +result.split('-')[1] ? 1 : 0;
        second.lost += +result.split('-')[0] > +result.split('-')[1] ? 1 : 0;
        second.goalsFor += +result.split('-')[1];
        second.goalsAgainst += +result.split('-')[0];
        second.goalsDifference = (second.goalsFor - second.goalsAgainst).toString();
        second.points = second.won * 3 + second.ties;
    }

    private createFixtures = () => {
        this.displayFixtures();
        this.addPagination();
        this.scrollToCurrentRound(1.2);
    }

    private addPagination = () => {
        this.prev = Sprite.from(`prev`);
        this.prev.x = App.width * 0.02;
        this.prev.y = App.height * 0.18;
        this.prev.width = App.width * 0.075;
        this.prev.scale.y = this.prev.scale.x;
        this.prev.anchor.set(0, 0);
        this.addChild(this.prev);
        this.prev.interactive = true;
        this.prev.alpha = this.currentRound === 1 ? 0.35 : 1;
        this.prev.on('pointerdown', () => {
            let x = this.fixturesContainer.x;
            this.selectedRound--;
            gsap.to(this.fixturesContainer, 0.5,
                {
                    x: x += App.width,
                    ease: "Back.easeInOut",
                    onStart: () => {
                        this.prev.interactive = false;
                        this.next.interactive = false;
                        this.prev.alpha = 0.35;
                        this.next.alpha = 0.35;
                    },
                    onComplete: () => {
                        if (this.selectedRound !== 1) {
                            this.prev.interactive = true;
                            this.prev.alpha = 1;
                        }
                        this.next.interactive = true;
                        this.next.alpha = 1;
                    }
                }
            );
        })

        this.next = Sprite.from(`next`);
        this.next.x = App.width * 0.98;
        this.next.y = App.height * 0.18;
        this.next.width = App.width * 0.075;
        this.next.scale.y = this.next.scale.x;
        this.next.anchor.set(1, 0);
        this.addChild(this.next);
        this.next.interactive = true;
        this.next.alpha = this.currentRound === App.leagueRounds ? 0.35 : 1;
        this.next.on('pointerdown', () => {
            let x = this.fixturesContainer.x;
            this.selectedRound++;
            gsap.to(this.fixturesContainer, 0.5,
                {
                    x: x -= App.width,
                    ease: "Back.easeInOut",
                    onStart: () => {
                        this.prev.interactive = false;
                        this.next.interactive = false;
                        this.prev.alpha = 0.35;
                        this.next.alpha = 0.35;
                    },
                    onComplete: () => {
                        this.prev.interactive = true;
                        this.prev.alpha = 1;
                        if (this.selectedRound !== App.leagueRounds) {
                            this.next.interactive = true;
                            this.next.alpha = 1;
                        }
                    }
                }
            );
        })
    }

    private getNextOpponent = () => {
        let playerClub = App.playerClubData.name;
        let game: string = App.seasonFixtures[this.currentRound].find((x: string | any[]) => x.includes(playerClub))!;
        let firstClub = game.split(":")[0];
        let secondClub = game.split(":")[1];

        if (firstClub === playerClub) {
            App.opponentClubData = App.allClubs.find((c: { name: any; }) => c.name === secondClub).clubData;
            App.isPlayerHome = true;
        } else if (secondClub === playerClub) {
            App.opponentClubData = App.allClubs.find((c: { name: any; }) => c.name === firstClub).clubData;
            App.isPlayerHome = false;
        }
    }

    private generateRoundScorers = () => {
        Object.keys(this.lastRoundGoals).forEach((team, index) => {
            for (let index = 0; index < this.lastRoundGoals[team]; index++) {
                let rnd = Math.floor(Math.random() * 100) + 1;
                let scorerIndex;
                if (rnd <= 5) {
                    scorerIndex = 0;
                }
                else if (rnd <= 15) {
                    scorerIndex = 1;
                }
                else if (rnd <= 25) {
                    scorerIndex = 2;
                }
                else if (rnd <= 45) {
                    scorerIndex = 3;
                }
                else if (rnd <= 65) {
                    scorerIndex = 4;
                }
                else {
                    scorerIndex = 5;
                }
                App.topScorers[team][scorerIndex]++;
            }
        })
    }

    private generateRoundYellowCards() {
        const playerClub = App.playerClubData.name;
        const opponentClub = App.opponentClubData.name;
        for (let index = 0; index < App.allClubNames.length; index++) {
            const club = App.allClubs[index].name;
            let randomYellowCardsNum = Math.floor(Math.random() * 3);
            if (club === playerClub) {
                continue;
            } else if (club === opponentClub) {
                for (let x = 0; x < App.level.opponentCards.children.length; x++) {
                    let card = App.level.opponentCards.children[x];
                    if (card.hasRedCard || card.hasYellowCard) {
                        App.mostYellowCards[club][x]++;
                    }
                }
            } else {
                for (let x = 0; x < randomYellowCardsNum; x++) {
                    //random player
                    let randomPLayerIdx = Math.floor(Math.random() * 5);
                    App.mostYellowCards[club][randomPLayerIdx]++;
                }
            }
        }
    }

    private ballParticle(action: string) {
        let container = new ParticleContainer;
        const textures = [
            "ball_prototype",
            "ball_red",
            "ball_green",
            "ball_blue",
            "ball_orange",
            "ball_purple",
            "ball_yellow"
        ]

        let emitter: Emitter = new Emitter(container, textures, ballParticleConfig());
            if (action === "add") {
                // this.addChildAt(container, 1);
                // emitter.emit = true;
                // this.emitters.push(emitter);

            } else {
                // emitter.destroy();
                // emitter.cleanup();
                // emitter.update = (): void => { };
            }
    }

    private addMoneySection = () => {

        // section bg
        this.moneySectionBG = Sprite.from(`container4`);
        this.moneySectionBG.width = App.width * 0.3;
        this.moneySectionBG.scale.y = this.moneySectionBG.scale.x;
        this.moneySectionBG.anchor.set(0, 0);
        this.moneySectionContainer.addChild(this.moneySectionBG);

        //coin animation
        // let coinAnimData: IAnimationData = {
        let coinAnimData = {
            name: "coins_anim",
            frames: 10,
            speed: 0.25,
            loop: true,
            paused: false
        }

        let frames = [];
        for (let frame = 1; frame <= coinAnimData.frames; frame++) {
            let current = `${coinAnimData.name}_${frame}`;
            frames.push(current);
        }
        this.coin = new AnimatedSprite(frames.map((s) => Texture.from(s)));
        this.coin.x = this.moneySectionContainer.width * 0.1;
        this.coin.y = this.moneySectionContainer.height * 0.07;
        this.coin.width = App.width * 0.06;
        this.coin.scale.y = this.coin.scale.x;
        this.moneySectionContainer.addChild(this.coin);
        this.coin.animationSpeed = coinAnimData.speed;
        this.coin.play();

        // money amount text
        console.log(App.playerCash);

        this.cashText = new Text(App.playerCash.toString() || "0", {
            fontFamily: config.mainFont,
            fontSize: App.height / 45,
            fill: '#dbb7b7',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 1.5
        });
        this.cashText.position.set(this.coin.x + this.coin.width, this.moneySectionContainer.height / 2);
        this.cashText.anchor.set(0, 0.5);
        this.moneySectionContainer.addChild(this.cashText);

        this.addChild(this.moneySectionContainer);
        this.moneySectionContainer.x = this.width * 0.02;
        this.moneySectionContainer.y = this.height * 0.015;

        if (this.lastGameRersult) {
            App.playerCash += App.lastGameWinnings;
            let cashBangUp = new BangUp(this.cashText, 1, this.cashText.text, App.playerCash, 1);
        }

    }
}

export interface IAnimationData extends AnimationEffect {
    name: string;
    frames: number;
    speed: number;
    loop: boolean;
    paused: boolean;
}

export interface IHeadersPositionsX {
    [key: string]: number;
}

export interface IPositionsX {
    [key: string]: number;
}
