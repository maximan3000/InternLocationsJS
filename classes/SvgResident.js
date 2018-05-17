/* класс, описывающий жителя */
class SvgResident {
	/* поля класса: 
	Name - имя
	Status - статус персонажа
	Species - раса
	Type - подраса
	Gender - пол
	Image - URL аватарки

	SVG - объект SVG для текущего экземпляра
	*/

	/* задать поля объекта */
	constructor(name, status, species, type, gender, image) {
		this.Name = name;
		this.Status = status;
		this.Species = species;
		this.Type = type;
		this.Gender = gender;
		this.Image = image;

		this.SVG = null;
	}

	/* получить SVG элемен изображение текущего объекта для отрисовки в SVG области */
	getSvgElement(x,y,length) {
		/* создание элемента DOM для информации о локации */
		var title = document.createElementNS("http://www.w3.org/2000/svg","title");
		title.innerHTML = 
			"Name: " + this.Name + "<br>" +
			"Status: " + this.Status + "<br>" +  
			"Species: " + this.Species + "<br>" +  
			"Type: " + this.Type + "<br>" + 
			"Gender: " + this.Gender;

		/* создание элемента SVG для отрисовки аватарки */
		var svgImage = document.createElementNS("http://www.w3.org/2000/svg","image");
		svgImage.setAttribute("width", length);
		svgImage.setAttribute("height", length);
		svgImage.setAttribute("x", x);
		svgImage.setAttribute("y", y);
		svgImage.setAttribute("class", "image");
		svgImage.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink");
		svgImage.setAttribute("href", this.Image);

		svgImage.appendChild(title);

		this.SVG = svgImage;

		return svgImage;
	}

	/* возвращает не связанный с данными объект (просто квадрат) */
	static getSvgElementEmpty(x,y,length) {
		var svgImage = document.createElementNS("http://www.w3.org/2000/svg","rect");
		svgImage.setAttribute("width", length);
		svgImage.setAttribute("height", length);
		svgImage.setAttribute("x", x);
		svgImage.setAttribute("y", y);
		svgImage.setAttribute("class", "image");
		svgImage.setAttributeNS("http://www.w3.org/2000/xmlns/","xmlns:xlink","http://www.w3.org/1999/xlink");
		return svgImage;
	}

}