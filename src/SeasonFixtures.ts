
export class SeasonFixtures {

    public static create(teams: string[]) {
        for (let i = teams.length - 1; i > 0; i--) {   // randomize clubs
            const j = Math.floor(Math.random() * (i + 1));
            [teams[i], teams[j]] = [teams[j], teams[i]];
        }
        const rounds = teams.length * 2 - 2;
        let seasonFixtures: ISeasonFixtures = {};

        //8 clubs tournament schedule ... https://tournamentscheduler.net/
        let matrix = [
            // ["2", "1", "6", "5", "7", "3", "8", "4"],
            // ["2", "7", "8", "6", "4", "1", "3", "5"],
            // ["2", "5", "1", "3", "6", "4", "7", "8"],
            // ["2", "4", "3", "8", "5", "7", "1", "6"],
            // ["2", "6", "7", "1", "8", "5", "4", "3"],
            // ["2", "8", "4", "7", "3", "6", "5", "1"],
            // ["2", "3", "5", "4", "1", "8", "6", "7"]

            ["5", "2", "9", "10", "11", "12", "6", "3", "4", "1", "8", "7"],
            ["5", "8", "7", "4", "1", "6", "3", "11", "12", "9", "10", "2"],
            ["5", "12", "10", "3", "2", "1", "9", "7", "11", "8", "6", "4"],
            ["5", "10", "2", "12", "9", "3", "11", "1", "6", "7", "4", "8"],
            ["5", "7", "1", "8", "3", "4", "12", "6", "10", "11", "2", "9"],
            ["5", "3", "12", "1", "10", "7", "2", "8", "9", "4", "11", "6"],
            ["8", "3", "7", "1", "5", "9", "11", "2", "6", "10", "4", "12"],
            ["5", "11", "6", "9", "4", "2", "8", "10", "7", "12", "1", "3"],
            ["5", "6", "4", "11", "8", "9", "7", "2", "1", "10", "3", "12"],
            ["5", "1", "3", "7", "12", "8", "10", "4", "2", "6", "9", "11"],
            ["5", "4", "8", "6", "7", "11", "1", "9", "3", "2", "12", "10"]

        ];

        matrix.forEach((element, index) => {
            if (index % 2 !== 0) {
                let temp = element[0];
                element[0] = element[1];
                element[1] = temp;
            }
            let item = element.slice().reverse();
            matrix.push(item);
        });

        for (let index = 0; index < matrix.length; index++) {
            let data: string[] = matrix[index];
            seasonFixtures[index + 1] = [];
            for (let n = 0; n < data.length; n += 2) {
                let team1: number = +data[n] - 1;
                let team2: number = +data[n + 1] - 1;
                seasonFixtures[index + 1].push(`${teams[team1]}:${teams[team2]}`);
            }
        }
        console.log(seasonFixtures);
        return seasonFixtures;
    }
}

export interface ISeasonFixtures {
    [key: number | string]: string[];
}
