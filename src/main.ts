import { popupMananger, setup } from "./popup";
import "./style.scss";

setup();

document.getElementById("start")!.addEventListener("click", () => {
	popupMananger.create(100, 100, 100, 100, popup => {
		popup.win.document.body.innerHTML = `<h1>${popup.x}</h1>`
	})
})