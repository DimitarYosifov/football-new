import { App } from "./App";
import { Container, Text, TextStyle } from "pixi.js";
import { config } from "./configs/MainGameConfig";
import gsap from "gsap";

export function createText(_text: string, style: TextStyle, parent: Container, y: number, x: number, anchorX: number, anchorY: number, fontSize: number) {
    let text = new Text(_text, style);

    text.style.fontSize = Math.ceil(fontSize);
    // console.log(text.style.fontSize);
    text.position.set(x, y);
    text.anchor.set(anchorX, anchorY);
    parent.addChild(text);
    return text;
}
