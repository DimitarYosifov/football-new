import { Sprite, Texture, Text } from "pixi.js";
import { App } from "../App";
import gsap from "gsap";
import { config } from "../configs/MainGameConfig";

export class RotatingButton extends Sprite {

    private defaultTexture: string;
    private onInteractionTexture: string;
    public finalTexture: Sprite;
    public label: Text;
    private btn_rotation: GSAPTween;

    constructor(defaultTexture: string, onInteractionTexture: string, onPointerDown: Function) {
        super();
        this.defaultTexture = defaultTexture ? defaultTexture : "ball_prototype";
        this.onInteractionTexture = onInteractionTexture ? onInteractionTexture : "ball_green";
        this.finalTexture = Sprite.from(this.defaultTexture);
        this.finalTexture.anchor.set(0.5);
        this.finalTexture.interactive = true;
        this.finalTexture.on('pointerdown', () => {
            this.activate();
            gsap.delayedCall(0.2, () => {
                onPointerDown();
                this.deactivate();
            });
        })
        this.finalTexture.on('pointerover', () => {
            this.activate();
        })

        this.finalTexture.on('pointerout', () => {
            this.deactivate();
        })
    }

    setButtonSize(scale: number, x: number, y: number) {
        this.finalTexture.height = scale;
        this.finalTexture.scale.x = this.finalTexture.scale.y;
        this.finalTexture.x = x;
        this.finalTexture.y = y;
    }

    addLabel(text: string, fontSize: number, options = {}) {
        let style = {
            ...{
                fontFamily: config.mainFont,
                fontSize: this.finalTexture.height * fontSize,
                fill: '#f5f5dc',
                align: 'center',
                stroke: '#000000',
                fontWeight: 200,
                strokeThickness: 4
            }, options
        }
        this.label = new Text(text, style as any);
        this.label.anchor.set(0.5, 0.5);
        this.label.position.set(
            this.finalTexture.x,
            this.finalTexture.y
        );
        this.finalTexture.parent.addChild(this.label);
    }

    activate() {
        this.label.style.stroke = "#f5f5dc";
        this.label.style.fill = "#000000";
        if (!this.btn_rotation) {
            this.btn_rotation = gsap.to(this.finalTexture, 3000, {
                rotation: 360
            });
        } else {
            this.btn_rotation.play();
        }
        this.finalTexture.texture = Texture.from(this.onInteractionTexture);
    }

    deactivate() {
        this.label.style.stroke = "#000000";
        this.label.style.fill = "#f5f5dc";
        this.btn_rotation.pause();
        this.finalTexture.texture = Texture.from(this.defaultTexture);
    }
}
