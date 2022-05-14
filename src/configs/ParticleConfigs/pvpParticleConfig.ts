import { App } from "../../App";

export function pvpParticleConfig() {
    return {
        "alpha": {
            "start": 0.3,
            "end": 0
        },
        "scale": {
            "start": 0.1,
            "end": 1 
        },
        "speed": {
            "start": 200,
            "end": 30
        },
        "startRotation": {
            "min": 270,
            "max": 270
        },
        "rotationSpeed": {
            "min": 110,
            "max": 360
        },
        "lifetime": {
            "min": 0.5,
            "max": 1
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
            "x": App.width * 0.37,
            "y": App.height * 0.0,
            "w": App.width * 0.26,
            "h": App.height * 0.5
        }
    }
}
