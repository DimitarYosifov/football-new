import { App } from "./App";
import { Container, Text, TextStyle } from "pixi.js";
import { config } from "./configs/MainGameConfig";
import gsap from "gsap";

export function createText(_text: string, style: TextStyle, parent: Container, y: number, x: number, anchorX: number, anchorY: number, fontSize: number) {
    style.fontSize = fontSize;
    let text = new Text(_text, style);
    text.position.set(x, y);
    text.anchor.set(anchorX, anchorY);
    parent.addChild(text);
    return text;
}
