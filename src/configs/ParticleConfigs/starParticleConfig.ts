import { App } from "../../App";

export function starParticleConfig() {
    return {
        "alpha": {
            "start": 1,
            "end": 0.15
        },
        "scale": {
            "start": 0.35,
            "end": 0.15
        },
        // "color": {
        //     "start": "#6c6c6c",
        //     "end": "#ababab"
        // },
        "speed": {
            "start": 700,
            "end": 0
        },
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "rotationSpeed": {
            "min": 0,
            "max": 360
        },
        "lifetime": {
            "min": 0.75,
            "max": 1.5
        },
        "blendMode": "normal",
        "frequency": 0.0005,
        "emitterLifetime": 0,
        "maxParticles": 2000,
        "pos": {
            "x": App.width * 0.5,
            "y": App.height * 0.5
        },
        "addAtBack": true,
        "spawnType": "circle",
        "spawnCircle": {
            "x": 0,
            "y": 0,
            "r": 100
        }
    }
}
