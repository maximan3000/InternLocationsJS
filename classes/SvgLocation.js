/* класс, описывающий локацию */
class SvgLocation {
	/* поля класса: 
	Name - объект SVG DOM-модели
	Type - тип локации (н-р планета)
	Dimension - положение локации (н-р система)
	ResidentsArr - набор всех id жителей этой локации
	*/

	/* задать поля объекта */
	constructor(name, type, dimension, residentsArr) {
		this.Name = name;
		this.Type = type;
		this.Dimension = dimension;
		this.ResidentsArr = residentsArr;

		this.svg = null;
	}

	/* вернуть число жителей в данной локации */
	get ResidentsCount() {
		return this.ResidentsArr.length;
	}

	/* обработка нажатия на элемент SVG локации */
	onClickHandler(target) {
		console.dir(target);
	}

	/* получить SVG элемент-прямоугольник текущего объекта для отрисовки в SVG области */
	getSvgElement(x,y,width,height) {
		/* создание элемента DOM для информации о локации */
		var title = document.createElementNS("http://www.w3.org/2000/svg","title");
		title.innerHTML = 
			"Name: " + this.Name + "<br>" + 
			"Type: " + this.Type + "<br>" + 
			"Dimension: " + this.Dimension + "<br>" + 
			"Has " + this.ResidentsCount + " residents";

		/* создание элемента SVG для отрисовки прямоугольника */
		var svgRectangle = document.createElementNS("http://www.w3.org/2000/svg","rect");
		svgRectangle.setAttribute("width", width);
		svgRectangle.setAttribute("height", height);
		svgRectangle.setAttribute("x", x);
		svgRectangle.setAttribute("y", y);
		svgRectangle.setAttribute("class", "rectangle");
		svgRectangle.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink");

		svgRectangle.appendChild(title);

		this.svg = svgRectangle;

		return svgRectangle;
	}
}