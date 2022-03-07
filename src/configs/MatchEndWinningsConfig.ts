export const matchEndWinningsPopup: any = {
    cashPerPoint: 30000,
    cashPerGoal: 5000,
    attendance: {
        home: {
            //keys here mean club power
            1: {
                min: 200,
                max: 600,
            },
            2: {
                min: 400,
                max: 1200,
            },
            3: {
                min: 800,
                max: 2400,
            },
            4: {
                min: 1600,
                max: 4800,
            },
            5: {
                min: 3200,
                max: 9600,
            },
            6: {
                min: 6400,
                max: 19200,
            },
            7: {
                min: 12800,
                max: 38400,
            }
        },
        away: {
            //keys here mean club power
            // away attendance is 10% of home attendance 
            //  NOTE - see if it works well...
            1: {
                min: 20,
                max: 60,
            },
            2: {
                min: 40,
                max: 120,
            },
            3: {
                min: 80,
                max: 240,
            },
            4: {
                min: 160,
                max: 480,
            },
            5: {
                min: 320,
                max: 960,
            },
            6: {
                min: 640,
                max: 1920,
            },
            7: {
                min: 1280,
                max: 3840,
            }
        }
    },
    ticketPrice: {
        //keys here mean club power
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
        7: 7
    },
    yellowCardFine: 2000,
    redCardFine: 10000,
    injuriesExpenses: {
        min: 3000,
        max: 20000
    }
}