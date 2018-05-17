/* объекты реального времени */
/* объект класса SvgArea */
var SvgAreaObj;

/* дождаться загрузки DOM модели */
document.addEventListener("DOMContentLoaded", init);

/* инициализация объектов */
function init() {
	/* создание экземпляра SvgArea */
	var SvgDom = document.getElementById("SvgDom");
	SvgAreaObj = new SvgArea(SvgDom);

	/* заполнить SVG все пространство */
	resizeSvg();

	/* заполнить данные о локациях */
	SvgAreaObj.getLocations();

	/* разность высоты body и SVG*/
	diffHeight = document.body.clientHeight - SvgDom.clientHeight;

	/* обработка события изменения размера окна */
	window.onresize = redrawSvg;
}

/* изменить размер SVG */
function resizeSvg() {
	/* подвести высоту SVG под высоту документа (почему то body всегда выше на 4 пикселя) */
	SvgAreaObj.SVG.setAttribute("height", document.documentElement.clientHeight-4);
}

/* перерисовка SVG */
function redrawSvg() {
	SvgAreaObj.SVG.innerHTML = "";
	/* размер на все окно */
	resizeSvg();
	/* перерисовка */
	if ("Locations"==SvgAreaObj.CurrentDraw) {
		SvgAreaObj.drawLocations();
	}
	else if("Residents"==SvgAreaObj.CurrentDraw) {
		SvgAreaObj.drawResidents(SvgAreaObj.CurrentLocation);
	}
}