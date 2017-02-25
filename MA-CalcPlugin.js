/*
Slider Calculator Plugin
Author: Yashnikov Vyacheslav
Contact: https: //webflow.com/vyacheslav 


	$(document).ready(function () {
		$('#children-slider').Counter({
			SliderMax: 15,
			SliderMin: 10,
			SliderValue: 12,
			varName: "chidren"
		});
		$('.counter').ThausandFormat();
		recount();
	});

function recount() {
	var X = chidren
	$('.result').html(X.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
}
*/
(function ($) {
	$.fn.extend({
		Counter: function (options) {
			this.defaults = {
				SliderMin: 1,
				SliderMax: 50,
				SliderValue: 4,
				varName: "varSliderValue"
			};
			var settings = $.extend({}, this.defaults, options);
			return this.each(function () {
				var CounterWrapper = this;
				// Флаг начала отсчета
				var counterInc = false;
				var counterDec = false;
				var slider = $(".ui-widget-content", CounterWrapper);
				var sliderInput = $(".counter", CounterWrapper);
				sliderInput.attr('readonly', 'true');
				slider.slider({
					range: "min",
					value: settings.SliderValue,
					min: settings.SliderMin,
					max: settings.SliderMax,
					slide: function (event, ui) {
						sliderInput.val(ui.value).trigger("change");
					}
				});
				sliderInput.val(slider.slider("value"));
				sliderInput.on("keyup", function () {
						slider.slider("option", "value", +sliderInput.val().toString().replace(/[^\d]/g, ''));
					})
					// Счетчик
				var counter = slider.slider("value");
				var idproc
				slider.draggable();
				// Зажата клавиша мыши
				$(".inc", CounterWrapper).on('mousedown', function () {
					counterInc = true;
					counter = slider.slider("value")
					idproc = setInterval(calculation, 100)
				});
				$(".dec", CounterWrapper).on('mousedown', function () {
					counterDec = true;
					counter = slider.slider("value")
					idproc = setInterval(calculation, 100)
				});
				$(".inc", CounterWrapper).on('tap', function () {
					counter = slider.slider("value")
					if (counter != settings.SliderMax) {
						sliderInput.val(++counter).trigger("change");
						slider.slider("option", "value", counter).val();
					}
				});
				$(".dec", CounterWrapper).on('tap', function () {
					counter = slider.slider("value")
					if (counter != settings.SliderMin) {
						sliderInput.val(--counter).trigger("change");
						slider.slider("option", "value", counter).val();
					}
				});

				// Отпущена клавиша мыши
				$(".inc", CounterWrapper).mouseup(function () {
					counterInc = false;
				}).mouseleave(function () {
					counterInc = false;
				});
				$(".dec", CounterWrapper).mouseup(function () {
					counterDec = false;
				}).mouseleave(function () {
					counterDec = false;
				});
				// Подсчет секунд
				function calculation() {
					if (counterInc && counter != settings.SliderMax) {
						sliderInput.val(++counter).trigger("change");
						slider.slider("option", "value", counter).val();
					} else if (counterDec && counter != settings.SliderMin) {
						sliderInput.val(--counter).trigger("change");
						slider.slider("option", "value", counter).val();
					} else {
						clearInterval(idproc);
					}
				}
				$(document).ready(function () {
					window[settings.varName] = +$(sliderInput).val().toString().replace(/[^\d]/g, '');
				})
				$(sliderInput).on('keyup change', function () {
					window[settings.varName] = +$(sliderInput).val().toString().replace(/[^\d]/g, '');
					recount();
				});
			});
		}
	});
})(jQuery);
jQuery(function ($) {
	// узнать позицию курсора
	$.fn.getCursorPosition = function () {
			var input = this.get(0);
			if (!input) return;
			if ('selectionStart' in input) {
				return input.selectionStart;
			} else if (document.selection) {
				input.focus();
				var sel = document.selection.createRange();
				var selLen = document.selection.createRange().text.length;
				sel.moveStart('character', -input.value.length);
				return sel.text.length - selLen;
			}
		}
		// установить позицию курсора
	$.fn.setCursorPosition = function (pos) {
			if ($(this).get(0).setSelectionRange) {
				$(this).get(0).setSelectionRange(pos, pos);
			} else if ($(this).get(0).createTextRange) {
				var range = $(this).get(0).createTextRange();
				range.collapse(true);
				range.moveEnd('character', pos);
				range.moveStart('character', pos);
				range.select();
			}
		}
		// удалить выделенный текст
	$.fn.delSelected = function () {
		var input = $(this);
		var value = input.val();
		var start = input[0].selectionStart;
		var end = input[0].selectionEnd;
		input.val(
			value.substr(0, start) + value.substring(end, value.length)
		);
		return end - start;
	};

	$.fn.priceFormat = function () {

		function priceFormatted(element) {
			element = String(element).replace(/[^\d]/g, '');
			if (!element) return '';
			return ('$ ' + (String(parseInt(element))).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '));
		}

		$(this)
			// Отмена перетаскивания текста и вставки через контекстное меню
			.bind('contextmenu', function (event) {
				event.preventDefault();
			})
			.bind('drop', function (event) {
				var value = $(this).val();
				$(this).val(''); // хак для хрома
				$(this).val(value);
				event.preventDefault();
			})
			.on('keydown change', function (event) {
				var cursor = $(this).getCursorPosition();
				var code = event.keyCode;
				var startValue = $(this).val();
				if ((event.ctrlKey === true && code == 86) || // Ctrl+V | Shift+insert
					(event.metaKey === true && code == 86) ||
					(event.shiftKey === true && code == 45)) {
					return false;
				} else if (
					code == 9 || // tab
					code == 27 || // ecs
					event.ctrlKey === true || // все что вместе с ctrl
					event.metaKey === true ||
					event.altKey === true || // все что вместе с alt
					event.shiftKey === true || // все что вместе с shift
					(code >= 112 && code <= 123) || // F1 - F12
					(code >= 35 && code <= 39)) // end, home, стрелки
				{
					return;

				} else if (code == 8) { // backspace

					var delCount = $(this).delSelected();
					if (!delCount) {
						if (startValue[cursor - 1] === ' ') {
							cursor--;
						}
						$(this).val(startValue.substr(0, cursor - 1) + startValue.substring(cursor, startValue.length));
					}
					$(this).val(priceFormatted($(this).val()));
					$(this).setCursorPosition(cursor - (startValue.length - $(this).val().length - delCount));

				} else if (code == 46) { // delete

					var delCount = $(this).delSelected();
					if (!delCount) {
						if (startValue[cursor] === ' ') {
							cursor++;
						}
						$(this).val(startValue.substr(0, cursor) + startValue.substring(cursor + 1, startValue.length));
					}
					if (!delCount) delCount = 1;
					$(this).val(priceFormatted($(this).val()));
					$(this).setCursorPosition(cursor - (startValue.length - $(this).val().length - delCount));

				} else {
					$(this).delSelected();
					startValue = $(this).val();
					var key = false;
					// цифровые клавиши
					if ((code >= 48 && code <= 57)) {
						key = (code - 48);
					}
					// numpad
					else if ((code >= 96 && code <= 105)) {
						key = (code - 96);
					} else {
						$(this).val(priceFormatted($(this).val()));
						$(this).setCursorPosition(cursor);
						return false;
					}
					var length = startValue.length
					var value = startValue.substr(0, cursor) + key + startValue.substring(cursor, startValue.length);
					$(this).val(priceFormatted(value));
					$(this).setCursorPosition(cursor + $(this).val().length - startValue.length);
				}
				event.preventDefault();
			});
	};
	$.fn.ThausandFormat = function () {

		function priceFormatted(element) {
			element = String(element).replace(/[^\d]/g, '');
			if (!element) return '';
			return (String(parseInt(element))).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
		}

		$(this)
			// Отмена перетаскивания текста и вставки через контекстное меню
			.bind('contextmenu', function (event) {
				event.preventDefault();
			})
			.bind('drop', function (event) {
				var value = $(this).val();
				$(this).val(''); // хак для хрома
				$(this).val(value);
				event.preventDefault();
			})
			.on('keydown change', function (event) {
				var cursor = $(this).getCursorPosition();
				var code = event.keyCode;
				var startValue = $(this).val();
				if ((event.ctrlKey === true && code == 86) || // Ctrl+V | Shift+insert
					(event.metaKey === true && code == 86) ||
					(event.shiftKey === true && code == 45)) {
					return false;
				} else if (
					code == 9 || // tab
					code == 27 || // ecs
					event.ctrlKey === true || // все что вместе с ctrl
					event.metaKey === true ||
					event.altKey === true || // все что вместе с alt
					event.shiftKey === true || // все что вместе с shift
					(code >= 112 && code <= 123) || // F1 - F12
					(code >= 35 && code <= 39)) // end, home, стрелки
				{
					return;

				} else if (code == 8) { // backspace

					var delCount = $(this).delSelected();
					if (!delCount) {
						if (startValue[cursor - 1] === ' ') {
							cursor--;
						}
						$(this).val(startValue.substr(0, cursor - 1) + startValue.substring(cursor, startValue.length));
					}
					$(this).val(priceFormatted($(this).val()));
					$(this).setCursorPosition(cursor - (startValue.length - $(this).val().length - delCount));

				} else if (code == 46) { // delete

					var delCount = $(this).delSelected();
					if (!delCount) {
						if (startValue[cursor] === ' ') {
							cursor++;
						}
						$(this).val(startValue.substr(0, cursor) + startValue.substring(cursor + 1, startValue.length));
					}
					if (!delCount) delCount = 1;
					$(this).val(priceFormatted($(this).val()));
					$(this).setCursorPosition(cursor - (startValue.length - $(this).val().length - delCount));

				} else {
					$(this).delSelected();
					startValue = $(this).val();
					var key = false;
					// цифровые клавиши
					if ((code >= 48 && code <= 57)) {
						key = (code - 48);
					}
					// numpad
					else if ((code >= 96 && code <= 105)) {
						key = (code - 96);
					} else {
						$(this).val(priceFormatted($(this).val()));
						$(this).setCursorPosition(cursor);
						return false;
					}
					var length = startValue.length
					var value = startValue.substr(0, cursor) + key + startValue.substring(cursor, startValue.length);
					$(this).val(priceFormatted(value));
					$(this).setCursorPosition(cursor + $(this).val().length - startValue.length);
				}
				event.preventDefault();
			});
	};
});
