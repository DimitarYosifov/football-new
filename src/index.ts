import { App } from './App';
import { LoadingScene } from './scenes/LoadingScene';
import './css/style';

window.onload = () => {
    document.querySelector("body")!.style.display = "block";
    App.initialize(540, 960, 0x000000);
    const loading: LoadingScene = new LoadingScene();
    App.setScene(loading);
}
