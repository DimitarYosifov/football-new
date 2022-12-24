import { ServerRequest } from "../ServerRequest"
import { config } from "../configs/MainGameConfig";
import gsap from "gsap";
import { App } from "../App";

export default class LogIn {

    private wrapper: HTMLElement = document.querySelector("#wrapper")!;
    private userName: HTMLInputElement = document.querySelector("#username")!;
    private password: HTMLInputElement = document.querySelector("#password")!;
    private go: HTMLElement = document.querySelector("#go")!;
    private login: HTMLElement = document.querySelector("#login")!;
    private register: HTMLElement = document.querySelector("#register")!;
    protected action: string;
    private picked: boolean;

    constructor() {

        this.wrapper.style.opacity = "0";
        this.wrapper.style.pointerEvents = "none";

        this.userName.oninput = this.inputLength.bind(this);
        this.userName.style.opacity = "0.6";
        this.userName.style.pointerEvents = "none";

        this.password.oninput = this.inputLength.bind(this);
        this.password.style.opacity = "0.6";
        this.password.style.pointerEvents = "none";

        this.go.style.opacity = "0.6";
        this.go.style.pointerEvents = "none";
        this.go.addEventListener("click", this.goPressed.bind(this));

        this.wrapper.addEventListener("submit", (() => {
            this.goPressed();
        }));

        this.login.style.pointerEvents = "auto";
        this.login.addEventListener("click", this.loginPressed.bind(this));

        this.register.style.pointerEvents = "auto";
        this.register.addEventListener("click", this.registerPressed.bind(this));

        this.go.style.display = "block";
        this.login.style.display = "block";
        this.register.style.display = "block";
        this.userName.style.display = "block";
        this.password.style.display = "block";

        gsap.delayedCall(1.2, () => {
            gsap.to(this.wrapper, 0.5, { opacity: 1 });
        })

    }

    private loginPressed() {
        this.action = "login";
        this.enableInputs();
        gsap.to(this.register, 0.5, { opacity: 0.5 });
        gsap.to(this.login, 0.5, { opacity: 1 });
        gsap.to(this.userName, 0.5, { opacity: 1 });
        gsap.to(this.password, 0.5, { opacity: 1 });
        this.userName.style.pointerEvents = "auto";
        this.password.style.pointerEvents = "auto";
    };

    private goPressed = () => {
        this.validate();
    };

    private enableInputs() {
        gsap.to(this.wrapper, 0.5, { opacity: 1 });
        if (!this.picked) {
            gsap.to(this.go, 1, { alpha: 0.6 });
        }
        this.picked = true;
    }

    private registerPressed() {
        this.action = "register";
        this.enableInputs();
        gsap.to(this.register, 0.5, { opacity: 1 });
        gsap.to(this.login, 0.5, { opacity: 0.5 });
        gsap.to(this.userName, 0.5, { opacity: 1 });
        gsap.to(this.password, 0.5, { opacity: 1 });
        this.userName.style.pointerEvents = "auto";
        this.password.style.pointerEvents = "auto";
    };

    private validate() {
        this.go.style.pointerEvents = "none";
        ServerRequest(
            this.action, //login or register,
            JSON.stringify({ user: this.userName.value, pass: this.password.value }),
            'POST',
        ).then((res: any) => {
            if (res.nameInUse) {
                this.clearUserInput();
                window.alert("name in use!"); //TODO... 
                this.go.style.pointerEvents = "auto";
                return;
            }
            if (res.authorized) {
                App.user = this.userName.value;
                localStorage.setItem("match3football", res.storageItem);
                localStorage.setItem("user", App.user);
                gsap.to(this.wrapper, config.fadeTimeBetweenPhases, {
                    opacity: 0, onComplete: () => {
                        App.checkGameInProgress();
                        this.wrapper.style.display = "none";
                        this.wrapper.remove();
                    }
                });
            }
            else if (!res.authorized) {
                this.clearUserInput();
                window.alert("invalid username or password!"); //TODO...
            }
        })
    }

    private clearUserInput() {
        (this.userName as HTMLInputElement).value = "";
        (this.password as HTMLInputElement).value = "";
        this.inputLength.bind(this);
    }

    //on input change. if any is empty, disable GO btn
    private inputLength() {
        if (this.userName.value === "" || this.userName.value === "") {
            this.go.style.pointerEvents = "auto"
            gsap.to(this.go, 0.15, { alpha: 0.6, interactive: false });
            return;
        }
        gsap.to(this.go, 0.3, { alpha: 1, interactive: true });
        this.go.style.pointerEvents = "auto"
    }
}
