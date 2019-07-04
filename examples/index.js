import Hanaland from "./Hanaland";
import Reanimate from "../src/Reanimate";

const hanaland = new Hanaland;
const reanimate = new Reanimate(hanaland);
reanimate.attach('#canvas');
reanimate.init();
reanimate.play();

window.reanimate = reanimate;
window.hanaland = hanaland;
