/* класс, описывающий наборы данных для работы с SVG
и способы обработки этих данных
 */
class SvgArea {
	/* поля класса: 
	SVG - объект SVG DOM-модели
	LocationsArr - набор локаций
	*/

	/* инициализация полей */
	constructor(SvgDomElement) {
		this.SVG = SvgDomElement;
		this.LocationsArr = [];

		/* подвести высоту SVG под высоту документа 
		разность высоты body и высоты области SVG (body по какой-то причине всегда отступает от нижнего края на 4px) */
		var diffHeight = document.body.clientHeight - this.SVG.clientHeight;
		this.SVG.setAttribute("height", document.documentElement.clientHeight - diffHeight);
	}

	/* прорисовка как завершатся все ajax */
	drawAtReady(count,countNeed) {
		if (count == countNeed) {
			this.drawLocations();
		}
	}

	/* получить информацию о всех локациях */
	getLocations() {
		/* число страниц, которые содержат данные о локациях на сервере */
		var countNeed;
		/* число полученных ajax ответов */
		var count = 0;
		/* так как this относительно callback в ajax-запросе меняется */
		var _this = this;
		/* прием данных во всех страницам */
		$.get("https://rickandmortyapi.com/api/location?page=1", function(data) {
			/* число страниц */
			countNeed = data.info.pages;
			/* записать полученные данные */
			_this.fullLocationsArr(data);

			/* если страница данных не одна, то сделать эти запросы повторно для остальных страниц */
			for (var i=2; i<=countNeed; i++) {
				$.get("https://rickandmortyapi.com/api/location?page="+i, function(data) {
					_this.fullLocationsArr(data);

					_this.drawAtReady(++count,countNeed);
				});
			}
			_this.drawAtReady(++count,countNeed);
		});

		
	}

	/* заполнить данные data с сервера в массив this.LocationsArr; элементы - экземпляры класса SvgLocation */
	fullLocationsArr(data) {
		for(var i=0; i<data.results.length; i++) {
			var location = new SvgLocation(data.results[i].name, data.results[i].type, data.results[i].dimension, data.results[i].residents);
			this.LocationsArr.push(location);
		}
	}

	/* получить общее число жителей во всех локациях; к каждой локоции прибавлен + 1 мнимый житель - для того, чтобы локация без жителей тоже занимала площадь на рисунке */
	get ResidentsCountPlusOne() {
		var count = 0;
		for(var i=0; i<this.LocationsArr.length; i++) {
			count += this.LocationsArr[i].ResidentsCount + 1;
		}
		return count;
	}


	/* минимальная площадь для изображения локации */
	get MinimalSquare() {
		return (this.SVG.clientWidth * this.SVG.clientHeight)/this.ResidentsCountPlusOne;
	}

	/* нарисовать прямоугольники для отображения локаций */
	drawLocations() {
		/* отсортировать массив локаций */
		this.sortLocaionsByResidentsCount();
		/* минимальный шаг отрисовки */
		var minSquare = this.MinimalSquare;
		/* текущие координаты для отрисовки */
		var y = 0, x = 0;
		/* высота полотна SVG - нужно для расчетов */
		var heightFull = this.SVG.clientHeight;

		/* фильтр - вернуть элементы которые > sizeLocation */
		var sizeLocation = 0;
		var filterLoc = function(locationElem) {
			return locationElem.ResidentsCount == sizeLocation;
		};
		/* индекс текущего элемента для отрисовки */
		var index = 0; var p = 0;
		while (index < this.LocationsArr.length) {
			/* изменить размер локации для фильтра */
			sizeLocation = this.LocationsArr[index].ResidentsCount;

			/* получить локации с одинаковым числом жителей (=> одинаковой площалью) для отрисовки */
			var arrLoc = this.LocationsArr.filter(filterLoc);
			/* найти параметры их оптимальной отрисовки */
			/* общая требуемая площадь */
			var squareFull = arrLoc.length*(sizeLocation+1)*minSquare;
			/* ширина каждого прямоугольника */
			var width = squareFull/heightFull;
			/* высота каждого прямоугольника */
			var height = (sizeLocation+1)*minSquare/width;

			/* отрисовка этих прямоугольников */
			for (var i = 0; i<arrLoc.length; i++ ){
				/* создать xml прямоугольник данной локации */
				var svgRect = arrLoc[i].getSvgElement(
					x,
					y,
					width,
					height
				);
				/* добавить его к полотну */
				this.SVG.appendChild(svgRect);
				/* добавить число жителей */
				this.drawText(sizeLocation, x, y);
				/* изменить координату y */
				y += height;
			}
			/* изменить координату x */
			x += width;
			/* обнулить y */
			y = 0;
			/* изменить индекс, по которому выбирается локация со следующем по порядку размером (можно, так как элементы отсортированы) */
			index += arrLoc.length;
		}
	}

	/* нарисовать данный текст в данной точке (иначе - не привязать) */
	drawText(sizeLocation, x, y) {
		var textSvg = document.createElementNS("http://www.w3.org/2000/svg","text");
		textSvg.textContent = sizeLocation;
		textSvg.setAttribute("x", x+2);
		textSvg.setAttribute("y", y+14);		
		textSvg.setAttribute("class", "text");

		this.SVG.appendChild(textSvg);
	}

	/* сортировка локаций по увеличению числа жителей */
	sortLocaionsByResidentsCount() {
		/* функция сравнения двух экземпляров SvgLocation */
		var compare = function(a,b) {
			if (a.ResidentsCount < b.ResidentsCount) return -1;
			return 1;
		};
		this.LocationsArr.sort(compare);
	}
}