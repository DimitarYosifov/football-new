import { Container, Sprite, TextStyle, Texture, Text } from "pixi.js";
import { App, IScene } from "../../App";
import { config } from "../../configs/MainGameConfig";
import { createText } from "../../createText";

export default class EmptySlot extends Sprite {

    private text: Text;
    public index: number;
    public logo: any;
    public player: any;
    private anchorX: number;

    constructor(x: number, y: number, anchorX: number, anchorY: number, index: number) {
        super();
        this.index = index;
        this.anchorX = anchorX;
        this.texture = Texture.from("frame");
        this.anchor.set(anchorX, anchorY);
        this.interactive = true;
        this.on('pointerdown', () => {
            App.ws.send(JSON.stringify({
                user: {
                    user: App.user,
                    team: App.playerClubData.name,
                    selectedSlot: this.index,
                    readyConfirmed: null,
                    isHome: this.index % 2 === 0
                }
            }));
            App.PvPSelectedSlotIndex = App.PvPSelectedSlotIndex === this.index ? -1 : this.index;
        })
        this.position.set(x, y);

        const getStyle = () => {
            return new TextStyle({
                fontFamily: config.mainFont,
                fontSize: App.height / 30,
                fill: '#dbb7b7',
                stroke: '#000000',
                strokeThickness: 3,
                fontWeight: "400"
            });
        }

        this.text = createText("Join", getStyle(), this, this.height / 2, this.width / 2, 0.5, 0.5, App.height / 30);
        this.text.x -= this.width * anchorX;
        // this.scale.set(0.85);

        this.setEnabled(true);
    }

    public setEnabled(enable: boolean): void {
        this.interactive = enable;
        this.buttonMode = true;
    }

    public setSelected(name: string, team: string) {

        console.log(name, team);
        this.name = name;
        this.logo = this.addLogo(team, this.width * 0.1, this.height * 0.5, 60, 0, 0.5);
        this.logo.x -= this.width * this.anchorX;

        this.addChild(this.logo);

        let style = new TextStyle({
            fontFamily: config.mainFont,
            fontSize: App.height / 30,
            fill: '#dbb7b7',
            // stroke: '#000000',
            // strokeThickness: 3,
            // fontWeight: "400"
        });
        this.player = createText(`${name}`, style, this, this.height / 2, this.width / 2, 0.5, 0.5, App.height / 30);
        this.player.x -= this.width * this.anchorX;
        this.text.visible = false;

    }

    public setEmpty() {
        this.text.visible = true;
        this.removeChild(this.logo);
        this.removeChild(this.player);
        this.logo = null;
        this.player = null;

    }

    private addLogo = (team: string, x: number, y: number, height: number, anchorX: number, anchorY: number) => {
        let logo = App.allClubs.filter((club: { name: string; }) => club.name === team)[0].clubData.logo;
        let clubLogo = Sprite.from(`${logo}`);
        clubLogo.height = height;
        clubLogo.x = x;
        clubLogo.y = y;
        clubLogo.scale.x = clubLogo.scale.y;
        clubLogo.anchor.set(anchorX, anchorY);
        return clubLogo;
    }
}
