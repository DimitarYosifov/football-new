
export class SeasonFixtures {

    public static create(teams: string[]) {
        for (let i = teams.length - 1; i > 0; i--) {   // randomize clubs
            const j = Math.floor(Math.random() * (i + 1));
            [teams[i], teams[j]] = [teams[j], teams[i]];
        }
        const rounds = teams.length * 2 - 2;
        let seasonFixtures = {};

        //8 clubs tournament schedule ... https://tournamentscheduler.net/
        let matrix = [
            ["2", "1", "6", "5", "7", "3", "8", "4"],
            ["2", "7", "8", "6", "4", "1", "3", "5"],
            ["2", "5", "1", "3", "6", "4", "7", "8"],
            ["2", "4", "3", "8", "5", "7", "1", "6"],
            ["2", "6", "7", "1", "8", "5", "4", "3"],
            ["2", "8", "4", "7", "3", "6", "5", "1"],
            ["2", "3", "5", "4", "1", "8", "6", "7"]
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
            let data = matrix[index];
            (seasonFixtures as any)[index + 1] = [];
            for (let n = 0; n < data.length; n += 2) {
                let team1 = (data as any)[n] - 1;
                let team2 = Number((data as any)[n + 1] - 1);
                (seasonFixtures as any)[index + 1].push(`${teams[team1]}:${teams[team2]}`);
            }
        }
        console.log(seasonFixtures);
        return seasonFixtures;
    }
}
