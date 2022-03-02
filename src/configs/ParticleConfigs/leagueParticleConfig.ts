import { App } from "../../App";

export function leagueParticleConfig() {
    return {
        "alpha": {
            "start": 0.8,
            "end": 0
        },
        "scale": {
            "start": 0.1,
            "end": 0.45
        },
        // "color": {
        //     "start": "#929191",
        //     "end": "#929191"
        // },
        "speed": {
            "start": 450,
            "end": 2
        },
        "startRotation": {
            "min": 270,
            "max": 270
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 1,
            "max": 1.3
        },
        "blendMode": "normal",
        "frequency": 0.0007,
        "emitterLifetime": 0,
        "maxParticles": 5000,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": true,
        "spawnType": "rect",
        "spawnRect": {
            "x": App.width * 0.7,
            "y": App.height * 0.53,
            "w": App.width * 0.30,
            "h": App.height * 0.05
        }
    }
}
