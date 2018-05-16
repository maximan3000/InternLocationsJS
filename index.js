/* объекты реального времени */
/* объект SVG DOM-модели */
var SvgAreaObj;

/* дождаться загрузки DOM модели */
document.addEventListener("DOMContentLoaded", init);

/* инициализация объектов */
function init() {
	/* создание экземпляра SvgArea */
	var SvgDom = document.getElementById("SvgDom");
	SvgAreaObj = new SvgArea(SvgDom);

	/* заполнить данные о локациях */
	SvgAreaObj.getLocations();
}