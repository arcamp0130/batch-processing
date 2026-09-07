import  "@sass/style.scss";
import { BatchesManager, HTMLManager } from "@managers/index";

function initApp(): void {
    HTMLManager.Instance;
    BatchesManager.Instance;
}

initApp();
