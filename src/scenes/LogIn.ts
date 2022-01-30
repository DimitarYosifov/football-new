// import { serverRequest } from "./Request.js"
// import { config } from "../configs/MainGameConfig";
import gsap from "gsap";

export default class LogIn {

    private wrapper: HTMLElement = document.querySelector("#wrapper")!;
    private userName: HTMLElement = document.querySelector("#username")!;
    private password: HTMLElement = document.querySelector("#password")!;
    private go: HTMLElement = document.querySelector("#go")!;
    private login: HTMLElement = document.querySelector("#login")!;
    private register: HTMLElement = document.querySelector("#register")!;
    // private action: string;
    private picked: boolean;

    constructor() {

        // setTimeout(() => {
        //     document.getElementById("loading-wrapper").remove();
        // }, 1000);

        // this.stage = app.stage;
        // this.stage.visible = false;
        // this.stage.alpha = 0;
        // this.app = app;
        // this.config = config;

        //apply inputs style
        // this.wrapper = document.querySelector("#wrapper");
        // this.wrapper.style.width = this.app.width * 0.8 + "px";
        // this.wrapper.style.height = this.app.height / 5 + "px";
        this.wrapper.style.opacity = "0";
        this.wrapper.style.pointerEvents = "none";

        // this.username = document.querySelector("#username");
        // this.username.style.marginBottom = app.height * 0.05 + "px";
        // this.username.oninput = this.inputLength;
        this.userName.style.opacity = "0.6";
        this.userName.style.pointerEvents = "none";

        // this.password = document.querySelector("#password");
        // this.password.oninput = this.inputLength;
        this.password.style.opacity = "0.6";
        this.password.style.pointerEvents = "none";

        // this.go = document.querySelector("#go");
        this.go.style.opacity = "0.6";
        this.go.style.pointerEvents = "none";
        this.go.addEventListener("click", this.goPressed);

        this.wrapper.addEventListener("submit", (() => {
            this.goPressed();
        }));

        // this.login = document.querySelector("#login");
        this.login.style.pointerEvents = "auto";
        this.login.addEventListener("click", this.loginPressed);

        // this.register = document.querySelector("#register");
        this.register.style.pointerEvents = "auto";
        this.register.addEventListener("click", this.registerPressed);

        this.go.style.display = "block";
        this.login.style.display = "block";
        this.register.style.display = "block";
        this.userName.style.display = "block";
        this.password.style.display = "block";

        gsap.delayedCall(1.2, () => {
            gsap.to(this.wrapper, 0.5, { opacity: 1 });
            // gsap.to(this.stage, 0.5, { alpha: 1 });
        })

    }

    loginPressed = () => {
        // this.action = "login";
        // this.enableInputs();
        // gsap.to(this.register, 0.5, { opacity: 0.5 });
        // gsap.to(this.login, 0.5, { opacity: 1 });
        // gsap.to(this.userName, 0.5, { opacity: 1 });
        // gsap.to(this.password, 0.5, { opacity: 1 });
        // this.userName.style.pointerEvents = "auto";
        // this.password.style.pointerEvents = "auto";
    };

    goPressed = () => {
        // this.validate();
    };

    registerPressed = () => {
        // this.action = "register";
        // this.enableInputs();
        // gsap.to(this.register, 0.5, { opacity: 1 });
        // gsap.to(this.login, 0.5, { opacity: 0.5 });
        // gsap.to(this.userName, 0.5, { opacity: 1 });
        // gsap.to(this.password, 0.5, { opacity: 1 });
        // this.userName.style.pointerEvents = "auto";
        // this.password.style.pointerEvents = "auto";
    };

    enableInputs = () => {
        gsap.to(this.wrapper, 0.5, { opacity: 1 });
        if (!this.picked) {
            gsap.to(this.go, 1, { alpha: 0.6 });
        }
        this.picked = true;
    }

    // validate() {
    //     serverRequest(
    //         this.action, //login or register,
    //         'POST',
    //         'application/json',
    //         JSON.stringify({ user: this.username.value, pass: this.password.value }),
    //     ).then(res => {
    //         if (res.nameInUse) {
    //             this.clearUserInput();
    //             window.alert("name in use!"); //TODO... 
    //             return;
    //         }
    //         if (res.authorized) {
    //             this.app.user = this.username.value;
    //             localStorage.setItem("match3football", res.storageItem);
    //             localStorage.setItem("user", this.app.user);
    //             gsap.to(this.wrapper, config.fadeTimeBetweenPhases, { opacity: 0 });
    //             gsap.to(this.stage, config.fadeTimeBetweenPhases, {
    //                 alpha: 0, onComplete: () => {
    //                     this.stage.removeChildren();
    //                     this.app.checkGameInProgress();
    //                     gsap.killTweensOf("*");
    //                     this.wrapper.remove();
    //                     this.wrapper.style.display = "none";
    //                     this.stage.visible = true;
    //                 }
    //             });
    //         }
    //         else if (!res.authorized) {
    //             this.clearUserInput();
    //             window.alert("invalid username or password!"); //TODO...
    //         }
    //     })
    // }

    clearUserInput() {
        (this.userName as HTMLInputElement).value = "";
        (this.password as HTMLInputElement).value = "";
        this.inputLength();
    }

    //on input change. if any is empty, disable GO btn
    inputLength = () => {
        if ((this.userName as HTMLInputElement).value === "" || (this.userName as HTMLInputElement).value === "") {
            this.go.style.pointerEvents = "auto"
            gsap.to(this.go, 0.15, { alpha: 0.6, interactive: false });
            return;
        }
        gsap.to(this.go, 0.3, { alpha: 1, interactive: true });
        this.go.style.pointerEvents = "auto"
    }
}