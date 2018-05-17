/* класс, описывающий наборы данных для работы с SVG
и способы обработки этих данных
 */
class SvgArea {
	/* поля класса: 
	SVG - объект SVG DOM-модели
	LocationsArr - набор локаций

	CurrentDraw - текущий тип отрисовки ("Locations" или "Residents")
	CurrentLocation - если текущий тип "Residents", то указывает на объект SvgLocation, жители которого нарисованы

	*/

	/* инициализация полей */
	constructor(SvgDomElement) {
		this.SVG = SvgDomElement;
		this.LocationsArr = [];
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
		$.get("https://rickandmortyapi.com/api/location?page=1", 
			function(data) {
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
		/* параметры полотна */
		this.CurrentDraw = "Locations";
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
				/* добавить обработчик клика */
				svgRect.onclick = this.onClickHandler;
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
	drawText(text, x, y) {
		var textSvg = document.createElementNS("http://www.w3.org/2000/svg","text");
		textSvg.textContent = text;
		textSvg.setAttribute("x", x+2);
		textSvg.setAttribute("y", y+14);		
		textSvg.setAttribute("class", "text");

		this.SVG.appendChild(textSvg);
	}

	/* сортировка локаций по увеличению числа жителей */
	sortLocaionsByResidentsCount() {
		/* функция сравнения двух экземпляров SvgLocation */
		var compare = function(a,b) {
			if (a.ResidentsCount < b.ResidentsCount) return -1
			else if (a.ResidentsCount == b.ResidentsCount) return 
				(a.Name < b.Name)?1:-1;
			return 1;
		};
		this.LocationsArr.sort(compare);
	}


	/* обработка нажатия на элемент SVG локации - заполнение жителей и перерисовка */
	onClickHandler(event) {
		var SvgLocation = event.target.SvgLocation;
		/* если данные уже получены */
		if (SvgLocation.Cashed) {
			/* перерисовка сразу */
			SvgAreaObj.drawResidents(SvgLocation);
			return;
		}

		/* получить SvgLocation экземпляр данного SVG */
		var residentsArr = event.target.SvgLocation.ResidentsArr;
		var strAjax = "";
		
		/* если есть ссылки на жителей  */
		if (0!=residentsArr.length) {
			/* перый суффикс запроса */
			strAjax += residentsArr[0].replace(/.*[/]/, "");
			/* остальные суффиксы запроса */
			for (var i =1; i<residentsArr.length; i++){
				strAjax += "," + residentsArr[i].replace(/.*[/]/, "");
			}
			$.get("https://rickandmortyapi.com/api/character/"+strAjax, function(data)  {
				/* создание массива объектов-жителей SvgResident */
				var newArr = [];
				for (var i=0; i<data.length; i++) {
					var resident = new SvgResident(data[i].name, data[i].status, data[i].species, data[i].type, data[i].gender, data[i].image);
					newArr.push(resident);
				}
				/* если элемент один, то он не в массиве, а значит в цикле он не добавится */
				if (typeof data.length == "undefined") {
					var resident = new SvgResident(data.name, data.status, data.species, data.type, data.gender, data.image);
					newArr.push(resident);
				}
				/* замещение массива ссылок на массив жителей */
				SvgLocation.ResidentsArrObj = newArr;
				/* флаг того, что данные получены */
				SvgLocation.Cashed = true;
				/* перерисовка */
				SvgAreaObj.drawResidents(SvgLocation);
			});
		}
		else {
			/* перерисовка */
			SvgAreaObj.drawResidents(SvgLocation);
		}
		
	}

	/* нарисовать квадраты с картинками для отображения жителей */
	drawResidents(svgLocation) {
		/* полотно (плохо - связано с объектом уровня выше) */
		var svgObject = SvgAreaObj;
		/* параметры полотна */
		svgObject.CurrentDraw = "Residents";
		svgObject.CurrentLocation = svgLocation;
		/* очистка полотна */
		svgObject.SVG.innerHTML = "";
		/* параметры полотна */
		var height = this.SVG.clientHeight;
		var width = this.SVG.clientWidth;
		/* число объектов */
		var count = svgLocation.ResidentsArrObj.length;
		/**************************/
		/* высчитывание нужного размера квадрата
		c "_" начинаются переменные, используемые для рассчетов */
		/* число квадратов +1, так как есть 1 пустой квадрат */
		var _cnt = count+1;
		/* считаем соотношение сторон */
		var _a0 = Math.max(width, height)/Math.min(width,height);
		/* находим длину стороны по следующему принципу:
		1) соотношение {x : a0*x} (на x столбиков приходится y строк или наоборот)
		2) x*a0*x = число-квадратов-с-сохранением-пропорции
		сохранение этой пропорции гарантирует невыход за область рисования
		3) из этой формулы x = [sqrt(_cnt/a0)]; также нужно взять 
		округление к ближайшему целому, так как это - множитель, цель которого найти оптимальное число строк и столбцов (из-за пропорции размер x одинаков для целого ряда различного числа квадратов) */
		var _a1 = Math.ceil(Math.sqrt(_cnt/_a0));
		/* 
		4) так как x и a0*x - число строк/столбцов, то их значения - целые => имеет смысл отбросить дробь*/  
		var _xa0 = _a0*_a1;
		var _x = _a1;
		/* 
		5) осталось только вычислить длину стороны квадрата в пикселях (тут уже не важно - вычислять по длине или высоте, 
		так как пропорция сохраняет длину стороны постоянной) */
		var _xa0 = Math.max(width, height)/_xa0;
		/* длина стороны квадрата (шаг квадрата) 
		есть погрешность при вычислении таким путем которая видна,
		 если квадратов мало
		*/
		var step = _xa0;
		/**************************/
		/* текущие координаты для отрисовки */
		var y = 0, x = 0;
		/* первая аватарка - пустой квадрат 
		 обратиться к классу для создания пустого квадрата */
		var svgImage = SvgResident.getSvgElementEmpty(
			x,
			y,
			step
		);
		/* добавить пустой квадрат к полотну */
		svgObject.SVG.appendChild(svgImage);
		/* при нажатии вернуть отрисовку локаций (если так не упаковывать, то this меняется на тип event) */
		svgImage.onclick = function() { svgObject.drawLocations(); };
		/* добавить текст к пустому квадрату */
		svgObject.drawText("Back", x, y);
		x+=step;
		/* рисование аватарок */
		for (var i =0; i<count; i++) {
			if (x+step-1 >= width) { x=0; y+=step;}
			/* создать xml прямоугольник данной локации */
			var svgImage = svgLocation.ResidentsArrObj[i].getSvgElement(
				x,
				y,
				step
			);
			/* добавить его к полотну */
			svgObject.SVG.appendChild(svgImage);
			x += step;
		}
	}

}