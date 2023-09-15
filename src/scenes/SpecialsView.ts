import { Container, Sprite, TextStyle, Text, DisplayObject } from "pixi.js";
import { App, IScene } from "../App";
import { createText } from "../createText";
import { config } from "../configs/MainGameConfig";
import { RotatingButton } from "../buttons/RotatingButton";
import { gsap } from "gsap";
import { ServerRequest } from "../ServerRequest";
import BangUp from "../BangUp";

export class SpecialsView extends Container implements IScene {

    private backgroundImg: Sprite;
    private shopTitle: Text;
    private availableTitle: Text;
    private backBtn: RotatingButton;
    private availableItemsContainers: Container[] = [];
    private specialsInUse: number | undefined;
    private inUse: Text;
    private specialsInUsePositions: boolean[] = [false, false, false];

    constructor() {
        super();

        this.addBG();
        this.addTexts();
        console.log(App.playerSpecials);

        this.specialsInUse = App.playerSpecials.map(x => x.inUse).reduce((a: any, b: any) => a + b);

        // S H O P   I T E M S
        let shopItems = App.allSpecials;
        shopItems.forEach((item: IShopItemsConfig, idx: number) => {
            this.addShopItems(item, idx);
        });

        // A V A I L A B L E   I T E M S
        let availableItems = App.playerSpecials;
        availableItems.forEach((item: IShopItemsConfig, idx: number) => {
            this.addAvailableItems(item, idx);
        });

        let inUseItems = App.playerSpecials.filter((item: any) => item.inUse > 0);
        let counter = 0;
        inUseItems.forEach((item: IShopItemsConfig, idx: number) => {
            let inUse = item.inUse;
            while (inUse! > 0) {
                this.addInUseItems(item, counter);
                this.specialsInUsePositions[counter] = true;
                inUse!--;
                counter++
            }
        });

        this.addBackButton();
    }

    public update(time: number): void { };

    public addBG(): void {
        this.backgroundImg = Sprite.from("bg33"); // TODO change this sprite
        this.backgroundImg.x = 0;
        this.backgroundImg.y = 0;
        this.backgroundImg.width = App.width;
        this.backgroundImg.height = App.height;
        this.addChild(this.backgroundImg);
        this.backgroundImg.alpha = 1;
        this.backgroundImg.interactive = true;
    }

    private style(): TextStyle {
        return new TextStyle({
            fontFamily: config.mainFont,
            fill: '#ffffff',
            // stroke: '#000000',
            // strokeThickness: 1
        });
    }

    private addTexts(): void {
        let header = createText("SPECIALS", this.style(), this, App.height * 0.06, App.width * 0.05, 0, 0, App.width / 7);
        this.shopTitle = createText("Shop", this.style(), this, App.height * 0.15, App.width * 0.05, 0, 0, App.width / 15);
        this.availableTitle = createText("Available", this.style(), this, App.height * 0.45, App.width * 0.05, 0, 0, App.width / 15);
        this.inUse = createText("In use", this.style(), this, App.height * 0.7, App.width * 0.05, 0, 0, App.width / 15);
    }

    private addShopItems(item: IShopItemsConfig, idx: number) {

        //Container
        let container = new Container;
        container.name = `${item.name}`;
        this.addChild(container);

        //BG
        let bg = Sprite.from(`cartoonBox`);
        bg.width = App.width * 0.225;
        bg.scale.y = bg.scale.x;
        bg.anchor.set(0, 0);
        bg.x = 0.1 * container.x;
        bg.y = App.height * 0.04
        container.addChild(bg);

        //IMG
        let itemImg = Sprite.from(`${item.img}`);
        itemImg.width = App.width * 0.1;
        itemImg.scale.y = itemImg.scale.x;
        itemImg.anchor.set(0.5);
        itemImg.x = bg.width / 2;
        itemImg.y = bg.y + bg.height * 0.2
        container.addChild(itemImg);
        if (item.name === "Col Collector") {
            itemImg.angle = 90;
        }

        //NAME
        let itemName = createText(`${item.name}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0.5, 0.5, App.width / 34);
        itemName.anchor.set(0.5, 0.5);
        itemName.x = itemImg.x;
        itemName.y = itemImg.y + itemImg.height //+ App.height * 0.04
        container.addChild(itemName);

        //PRICE
        let itemPrice = createText(`${item.price}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0, 0, App.width / 34);
        itemPrice.anchor.set(0.5, 0.5);
        itemPrice.x = itemImg.x;
        itemPrice.y = itemName.y + itemName.height;
        container.addChild(itemPrice);

        //QUANTITY
        let itemQuantity = createText(`Quantity:${item.quantity}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0, 0, App.width / 34);
        itemQuantity.anchor.set(0.5, 0.5);
        itemQuantity.x = itemImg.x;
        itemQuantity.y = itemPrice.y + itemPrice.height;
        container.addChild(itemQuantity);

        //DESCRIPTION
        let itemDescrioption = createText(`${item.description}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0, 0, App.width / 34);
        itemDescrioption.anchor.set(0.5, 0);
        itemDescrioption.x = itemImg.x;
        itemDescrioption.y = itemQuantity.y + itemQuantity.height / 2;
        container.addChild(itemDescrioption);
        itemDescrioption.style.wordWrap = true;
        itemDescrioption.style.breakWords = true;
        itemDescrioption.style.wordWrapWidth = App.width * 0.2;
        itemDescrioption.style.leading = -5;

        //POSITION CONTAINER
        container.x = App.width * 0.05 + App.width * 0.225 * idx;
        container.y = this.shopTitle.y + App.height * 0.15 * Math.round(idx / 8);

        //BUY BTN 
        let buyOnPointerDown = (): void => {
            //decrease shop item quantity
            let s: any = App.allSpecials.find(x => x.name === item.name);
            if (s.quantity === 0) return;
            s.quantity--;
            itemQuantity.text = `Quantity:${s.quantity}`;

            App.playerCash -= item.price!;
            this.takePlayerMoney();

            if (s.quantity === 0) {
                //no more items of this kind. remove them visually
                buyBtn.finalTexture.interactive = false;
                buyBtn.alpha = 0.3;
                container.alpha = 0.3;
            }

            //add item to player items
            let ps: any = App.playerSpecials.find(x => x.name === item.name);
            if (ps) {
                ps.quantity++;
                let container = this.availableItemsContainers.find(x => x.name === item.name);
                let quantityTextField: any = container?.getChildByName("itemQuantity");
                quantityTextField.text = `Quantity:${ps.quantity}`;
                container!.alpha = 1;
                container!.children[4].alpha = 1;
                container!.children[4].interactive = true;
            }

            buyBtn.finalTexture.interactive = App.playerCash >= (item as any).price && (item as any).quantity > 0;
            buyBtn.alpha = App.playerCash >= (item as any).price && (item as any).quantity > 0 ? 1 : 0.65;
            container.alpha = App.playerCash >= (item as any).price && (item as any).quantity > 0 ? 1 : 0.65;
        }

        let buyBtn = new RotatingButton("", "", buyOnPointerDown, false);
        container.addChild(buyBtn.finalTexture);
        buyBtn.setButtonSize(App.height * 0.05, bg.x + bg.width / 2, bg.y + bg.height + App.height * 0.03);
        buyBtn.addLabel(`BUY`, 0.45);
        buyBtn.finalTexture.interactive = App.playerCash >= (item as any).price && (item as any).quantity > 0;
        buyBtn.alpha = App.playerCash >= (item as any).price && (item as any).quantity > 0 ? 1 : 0.65;
        container.alpha = App.playerCash >= (item as any).price && (item as any).quantity > 0 ? 1 : 0.65;
    }

    private addAvailableItems(item: IShopItemsConfig, idx: number) {

        //Container
        let container = new Container();
        container.name = `${item.name}`;
        this.addChild(container);

        //BG
        let bg = Sprite.from(`cartoonBox`);
        bg.width = App.width * 0.225;
        bg.scale.y = bg.scale.x * 0.75;
        bg.anchor.set(0, 0);
        bg.x = 0.1 * container.x;
        bg.y = App.height * 0.04
        container.addChild(bg);

        //IMG
        let itemImg = Sprite.from(`${item.img}`);
        itemImg.width = App.width * 0.1;
        itemImg.scale.y = itemImg.scale.x;
        itemImg.anchor.set(0.5);
        itemImg.x = bg.width / 2;
        itemImg.y = bg.y + bg.height * 0.35
        container.addChild(itemImg);
        if (item.name === "Col Collector") {
            itemImg.angle = 90;
        }

        //NAME
        let itemName = createText(`${item.name}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0.5, 0.5, App.width / 34);
        itemName.anchor.set(0.5, 0.5);
        itemName.x = itemImg.x;
        itemName.y = itemImg.y + itemImg.height;
        container.addChild(itemName);

        //QUANTITY
        let itemQuantity = createText(`Quantity:${+item.quantity}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0, 0, App.width / 34);
        itemQuantity.anchor.set(0.5, 0.5);
        itemQuantity.x = itemImg.x;
        itemQuantity.y = itemName.y + itemName.height;
        container.addChild(itemQuantity);
        itemQuantity.name = "itemQuantity"

        //POSITION CONTAINER
        container.x = App.width * 0.05 + App.width * 0.225 * idx;
        container.y = this.availableTitle.y + App.height * 0.15 * Math.round(idx / 8);

        //USE BTN 
        let availableOnPointerDown = () => {
            let obj: any = App.playerSpecials.find(x => x.name === item.name);
            if (this.specialsInUse === 3) return;
            this.specialsInUse!++;
            console.log(item);
            (item as any).inUse++;
            (item as any).quantity--;
            itemQuantity.text = `Quantity:${(obj).quantity}`;

            let targetIndex = this.specialsInUsePositions.findIndex(x => !x);
            this.specialsInUsePositions[targetIndex] = true;
            this.addInUseItems(item, targetIndex);

            App.playerSpecials.forEach(element => {
                let container = this.availableItemsContainers.find(x => x.name === element.name);
                container!.alpha = element.quantity === 0 ? 0.65 : 1;
                container!.children[4].alpha = element.quantity === 0 ? 0.65 : 1;
                container!.children[4].interactive = element.quantity === 0 ? false : true;
            });

            if (this.specialsInUse === 3) {
                this.availableItemsContainers.forEach(element => {
                    element.alpha = 0.65;
                    element.children[4].alpha = 0.65;
                    element.children[4].interactive = false;
                });
            }
        }

        let useBtn = new RotatingButton("", "", availableOnPointerDown, false);
        container.addChild(useBtn.finalTexture);
        useBtn.setButtonSize(App.height * 0.05, bg.x + bg.width / 2, bg.y + bg.height + App.height * 0.03);
        useBtn.addLabel(`USE`, 0.45);
        useBtn.finalTexture.interactive = this.specialsInUse !== 3 && item.quantity !== 0 ? true : false;
        useBtn.finalTexture.alpha = this.specialsInUse !== 3 && item.quantity !== 0 ? 1 : 0.65;
        container.alpha = this.specialsInUse !== 3 && item.quantity !== 0 ? 1 : 0.65;
        this.availableItemsContainers.push(container);
    }

    private addInUseItems(item: IShopItemsConfig, idx: number) {
        //Container
        let container = new Container();
        this.addChild(container);

        //BG
        let bg = Sprite.from(`cartoonBox`);
        bg.width = App.width * 0.22;
        bg.scale.y = bg.scale.x * 0.75;
        bg.anchor.set(0, 0);
        bg.x = 0.1 * container.x;
        bg.y = App.height * 0.6
        container.addChild(bg);

        //IMG
        let itemImg = Sprite.from(`${item.img}`);
        itemImg.width = App.width * 0.1;
        itemImg.scale.y = itemImg.scale.x;
        itemImg.anchor.set(0.5);
        itemImg.x = bg.width / 2;
        itemImg.y = bg.y + bg.height * 0.35
        container.addChild(itemImg);

        if (item.name === "Col Collector") {
            itemImg.angle = 90;
        }

        //NAME
        let itemName = createText(`${item.name}`, this.style(), this, App.height * 0.025, App.width * 0.05, 0.5, 0.5, App.width / 34);
        itemName.anchor.set(0.5, 0.5);
        itemName.x = itemImg.x;
        itemName.y = itemImg.y + itemImg.height //+ App.height * 0.04
        container.addChild(itemName);

        //POSITION CONTAINER
        container.x = App.width * 0.05 + App.width * 0.34 * idx;
        container.y = this.shopTitle.y + App.height * 0.15 * Math.round(idx / 8);

        //REMOVE BTN 
        let inUseOnPointerDown = () => {
            let obj: any = App.playerSpecials.find(x => x.name === item.name);
            let availContainer = this.availableItemsContainers.filter(x => x.name === item.name)[0];
            let quantityText: any = availContainer.getChildByName("itemQuantity");

            console.log(availContainer);

            this.specialsInUse!--;
            obj.quantity++
            obj.inUse--;
            container.destroy();
            quantityText.text = `Quantity:${(obj).quantity}`;

            App.playerSpecials.forEach(element => {
                let container = this.availableItemsContainers.find(x => x.name === element.name);
                container!.alpha = element.quantity === 0 ? 0.65 : 1;
                container!.children[4].alpha = element.quantity === 0 ? 0.65 : 1;
                container!.children[4].interactive = element.quantity === 0 ? false : true;
            });
            this.specialsInUsePositions[idx] = false;
        }

        let removeBtn = new RotatingButton("", "", inUseOnPointerDown, false);
        container.addChild(removeBtn.finalTexture);
        removeBtn.setButtonSize(App.height * 0.05, bg.x + bg.width / 2, bg.y + bg.height + App.height * 0.03);
        removeBtn.addLabel(`REMOVE`, 0.25);
        removeBtn.interactive = true;
    }

    private addBackButton(): void {
        //--BACK BUTTON
        let backOnPointerDown = () => {
            this.updateBackEnd();
            gsap.to([this.backBtn.finalTexture, this.backBtn.label], 0.3, {
                // delay: 0.2,
                ease: "Back.easeIn",
                x: App.width * 1.2,
                onComplete: () => { }
            });
        }
        this.backBtn = new RotatingButton("", "", backOnPointerDown, true);
        this.addChild(this.backBtn.finalTexture);
        this.backBtn.setButtonSize(App.height * 0.1, App.width * 1.2, this.height * 0.1);
        this.backBtn.addLabel(`Back`, 0.4);
        gsap.to([this.backBtn.finalTexture, this.backBtn.label], 0.3, {
            delay: 0.9,
            ease: "Back.easeOut",
            x: App.width * 0.9,
            onComplete: () => { }
        });
    }

    private updateBackEnd(): void {
        ServerRequest(
            "updateSpecials",
            JSON.stringify({
                user: App.user,
                playerCash: App.playerCash,
                playerSpecials: App.playerSpecials,
            }),
            "POST"
        ).then((res) => {
            let standingsView: any = App.app.stage.getChildByName("standingsView");
            let moneySectionContainer: any = this.getChildByName("moneySectionContainer");
            moneySectionContainer.setParent(standingsView);
            App.removeScene(this);
        });
    }

    private takePlayerMoney(): void {

        let standingsView: any = App.app.stage.getChildByName("standingsView");
        let moneySectionContainer: any = this.getChildByName("moneySectionContainer");

        let target = moneySectionContainer.children[2];
        let duration = 1;
        let startVal = target.text;
        let endVal = App.playerCash;
        let delay = 0;
        let onStart = null;
        let onUpdate = null;
        let onComplete = null;

        let bangUp: BangUp = new BangUp(
            target,
            duration,
            startVal,
            endVal,
            delay,
            onStart,
            onUpdate,
            onComplete
        )
        gsap.delayedCall(duration * 1.05, () => {
            // TODO - add layer to prevent taps during bang up
        })
    }
}

export interface IShopItemsConfig {
    img: string;
    name: string;
    _name?: string;
    price?: number;
    quantity: number | string;
    description?: string;
    inUse?: number;
}
