/* класс, описывающий локацию */
class SvgLocation {
	/* поля класса: 
	Name - название локации
	Type - тип локации (н-р планета)
	Dimension - положение локации (н-р система)
	ResidentsArr - набор всех ссылок на жителей этой локации
	ResidentsArrObj - набор всех SvgResident объектов жителей

	SVG - объект SVG для текущего экземпляра
	Cashed - заполнены ли данные о жителях (или только ссылки на них)
	*/

	/* задать поля объекта */
	constructor(name, type, dimension, residentsArr) {
		this.Name = name;
		this.Type = type;
		this.Dimension = dimension;
		this.ResidentsArr = residentsArr;

		this.ResidentsArrObj = [];		
		this.Cashed = false;
		this.SVG = null;
	}

	/* вернуть число жителей в данной локации */
	get ResidentsCount() {
		return this.ResidentsArr.length;
	}

	/* обработка нажатия на элемент SVG локации - заполнение жителей и перерисовка */
	onClickHandler(event) {
		var residentsArr = event.target.SvgLocation.ResidentsArr;
		var strAjax = "";
		if (0!=residentsArr.length) {
			strAjax += residentsArr[0].replace(/.*[/]/, "");
		}
		
		for (var i =1; i<residentsArr.length; i++){
			strAjax += "," + residentsArr[i].replace(/.*[/]/, "");
		}

		$.get("https://rickandmortyapi.com/api/character/"+strAjax, function(data)  {
			var newArr = [];
			for (var i=0; i<data.length; i++) {
				var resident = new SvgResident(data[i].name, data[i].status, data[i].species, data[i].type, data[i].gender, data[i].image);
				newArr.push(resident);
			}
			residentsArr = newArr;
			console.dir(residentsArr);
		});
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
		svgRectangle.SvgLocation = this;

		svgRectangle.appendChild(title);

		//svgRectangle.onclick = this.onClickHandler;

		this.SVG = svgRectangle;

		return svgRectangle;
	}
}