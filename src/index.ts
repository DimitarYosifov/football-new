import { Manager } from './Manager';
import { LoaderScene } from './scenes/LoaderScene';
import './css/style';

Manager.initialize(540, 960, 0x6495ed);

const loady: LoaderScene = new LoaderScene();
Manager.changeScene(loady);
