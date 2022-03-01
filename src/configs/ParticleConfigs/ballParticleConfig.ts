import { App } from "../../App";

export function ballParticleConfig() {
    return {
        "alpha": {
            "start": 1,
            "end": 0.6
        },
        "scale": {
            "start": 0.035,
            "end": 0.035
        },
        "color": {
            "start": "#6c6c6c",
            "end": "#ababab"
        },
        "speed": {
            "start": 65,
            "end": 45
        },
        "startRotation": {
            "min": 80,
            "max": 100
        },
        "rotationSpeed": {
            "min": 0,
            "max": 360
        },
        "lifetime": {
            "min": 20,
            "max": 20
        },
        "blendMode": "normal",
        "frequency": 0.7,
        "emitterLifetime": 0,
        "maxParticles": 40,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": true,
        "spawnType": "rect",
        "spawnRect": {
            "x": 0,
            "y": 0,
            "w": App.width,
            "h": 1
        }
    }
}
