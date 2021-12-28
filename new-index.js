(function() {
	'use strict';

	/**
     * result
     */

	var result;

	/**
     * current number
     */

	var currNum;

	/**
     * prev result
     */
	var prevResult;

	/**
     * history
     */

	var history;

	/**
     * rev btn pressed
     */

	var prevBtn;

    /**
    * math operation
    */

	var mathOp;

	/**
     * math operation counter
     */

	var prevMathOp;

	/**
     * math op pressed
     */

	var mathOpCount;

	/* math op pressed */

	var mathOpPress;

	/**
     * init
     */

	var isInit;


	/**
     * Array with previous operations and results
     */

	var mainHistoryLogger = [];

	/**
     * Main-screen
     */
	   
	
	var mainScreen = document.querySelector('#main-display');

	/**
     * History hellper for main-screen 
     */
	   
	var historyScreen = document.querySelector('#history-dis');

	/**
     *  Primary History
     */

	var showHistoryScreen = document.querySelector('#show-history');



	/**
     * attach click events to buttons 
     */

	$(document).ready(function() {

		$(".numpad-cell").click(function(e) {

			debugger;
			var btnClicked = $(this).data('value');
			input(btnClicked);
		});

		$(".tab-button").click(function(e) {

			debugger;
			historyMemory(this);
		});

	});

	/**
     *   initialize 
     */

	function init() {
		result = null;
		currNum = 0;
		prevBtn = null;
		mathOp = null;
		prevMathOp = null;
		mathOpCount = 0;
		history = '';
		mathOpPress = false;
		isInit = true;
		mainHistoryLogger = [];
		updateMainScreen(0);
		updateHistoryScreen(history);
		updateShowHistory("");
	}

	function input(btn) {

		/**
         * copy prev math op
         */

		if (!isNaN(prevBtn) && btn !== '=' && btn !== 'C' && btn !== 'CE' && btn !== '.') {
			prevMathOp = mathOp;
		}

		switch (btn) {
			case '+':
				mathOpPress = true;
				mathOp = addition;
				break;
			case '-':
				mathOpPress = true;
				mathOp = subtraction;
				break;
			case '/':
				mathOpPress = true;
				mathOp = division;
				break;
			case '*':
				mathOpPress = true;
				mathOp = multiplication;
				break;
			case 'C':
				init();
				break;
		}

		handler(btn);
		
		var fontSize = parseFloat(mainScreen.style.fontSize);

		/**
         * return to default main-screen size 
         */

		if (fontSize < 3 && currNum.length < 11) {
			mainScreen.style.fontSize = '3rem';
		}
	}

	function handler(btn) {

		/**
         *  return if C wasn't pressed when divide by zero was done 
         */

		if (btn !== 'C' && result === 'Result is undefined' || result === 'Cannot divide by zero') {
			return;
		}

		/**
         *  update history
         */

		if (btn !== '=' && btn !== 'C' && btn !== 'CE') {
			history = (isNaN(prevBtn) && isNaN(btn)) ? history.slice(0, -1) + btn : history + btn;
		}

		/**
         * btn clicked is `Number` or `.`
         */

		if (!isNaN(btn) || btn === '.') {
			if (btn === '.' && /^\d+$/.test(currNum)) {
				currNum = currNum.toString() + btn.toString();
			} else if (!isNaN(btn)) {
				if ((!isNaN(prevBtn) && prevBtn !== null && mainScreen.value !== '0') || prevBtn === '.') {
					currNum = parseFloat(currNum.toString() + btn.toString());
				} else {
					currNum = btn;
				}
			}
			mathOpPress = false;
			updateMainScreen(currNum);

			/**
             *   NUMPAD keys
             */

		} else {

			debugger;

			if (btn === '-' || btn === '+' || btn === '*' || btn === '/') {

				if ((prevBtn === null || prevBtn === '=') && !isInit) {
					history = '0' + btn;
					mathOpCount++;
				}

				if (!historyScreen.value.length && mainScreen.value.length) {
					history = mainScreen.value + btn;
				}
			}

			/**
             * if math op was pressed and result is null
             */

			if (mathOp && result === null) {
				result = Number(currNum);
			}

			/**
             * Count percents 
             */

			if (btn === '%') {
				history = history.slice(0, -(currNum.length + 1));
				currNum = percentage(currNum, result);
				history += currNum + ' ';
				updateMainScreen(currNum);

				/**
                 * Count square or square root 
                 */
				    
			} else if (btn === 'pow' || btn === 'sqrt' || btn === '1/x') {

				history = history.slice(0, -(currNum.length + btn.length)) + (btn === '1/x' ? '1/(' + currNum + ') ' : btn + '(' + currNum + ') ');

				if (btn === 'pow') {

					currNum = square(currNum);

				} else if (btn === 'sqrt') {

					currNum = squareRoot(currNum);

				} else {
					currNum = fraction(currNum)
				}

				updateMainScreen(currNum);
				updateHistoryScreen(history);
			}

			if (btn === '=') {

				if (mathOp) {
					mathOpCount = 0;
					if (mathOpPress) {
						mathOp(prevResult);
					} else {
						mathOp(Number(currNum));
					}

					mainHistoryLogger.push(history + ' = ' + result);

					history = '';
					prevBtn = btn;

					updateMainScreen(result);
					updateHistoryScreen(history);
					showHistory();
					prevResult = 0;

					return;
				}
			}

			/**
             *   if sign was pressed and prev btn isn't sign and except some buttons 
             */

			if (isNaN(btn) && (!isNaN(prevBtn) || prevBtn === '%' || prevBtn === 'pow' || prevBtn === 'sqrt' || prevBtn === '1/x') &&
				btn !== '=' && btn !== 'C' && btn !== 'CE' && btn !== '.' && btn !== '%' && btn !== 'pow' & btn !== 'sqrt' && btn !== '1/x') {
				mathOpCount++;
			}


			if (mathOpCount >= 2 && (!isNaN(prevBtn) || prevBtn === 'sqrt' || prevBtn === 'pow' || prevBtn === '1/x' || prevBtn === '%') && btn !== 'CE') {
				prevMathOp(Number(currNum));
				updateMainScreen(result);
			}

			if (btn === 'CE' && history.length > 0) {
				history = history.slice(0, -(currNum.length));
				currNum = '0';
				updateMainScreen(0);
			}

			if (result !== null && btn !== 'CE') {
				updateHistoryScreen(history);
			}
		}

		prevBtn = btn;
		prevResult = result;
		isInit = false;
	}

	function updateMainScreen(val) {

		val = String(val);

		if (val.length > 10) {
			mainScreen.style.fontSize = '1.75rem';
			val = Math.round(val * 10000000000000000) / 10000000000000000;
		}

		mainScreen.value = val;
	}

   /**
    * Update the hellper history screen for the main screen history 
    * @param {*} history 
    */

	function updateHistoryScreen(history) {
		historyScreen.value = history;
	}

/**
 * Addition
 * @param {*} val 
 */
	function addition(val) {
		result += val;
	}

/**
 * Subtraction
 * @param {*} val 
 */

	function subtraction(val) {
		result -= val;
	}

 /**
  *  Division
  * @param {*} val 
  */


	function division(val) {
		result /= val;
	}

/**
 * Multiplication
 * @param {*} val 
 */

	function multiplication(val) {
		result *= val;
	}

/**
 * Square
 * @param {*} val 
 * @returns 
 */

	function square(val) {
		return val * val;
	}

    /**
     * SquareRoot
     * @param {*} val 
     * @returns 
     */

	function squareRoot(val) {
		return Math.sqrt(val);
	}

    /**
     * Percentage
     * @param {*} val 
     * @param {*} res 
     * @returns 
     */

	function percentage(val, res) {
		return res * val / 100;
	}

/**
 * Fraction
 * @param {*} val 
 * @returns 
 */

	function fraction(val) {
		return 1 / val;
	}


	/**
     * History and Memory
     * @param {*} e 
     */

	function historyMemory(e) {
		var lableClicked = $(e).data('tab');

		debugger;
		switch (lableClicked) {
			case 'memory':
				$(e).addClass('active-tab');
				$("#show-history-tab").removeClass('active-tab');
				showMemory();
				break;
			case 'history':
				$(e).addClass('active-tab');
				$("#show-memory-tab").removeClass('active-tab');
				showHistory();
				break;
			default:
				break;
		}

	}


	function showHistory() {

		var output = "";

		for (var i = 0; i < mainHistoryLogger.length; i++) {
			output += mainHistoryLogger[i] + "\n";
		}

		updateShowHistory(output);
	}

	function showMemory() {}

	function updateShowHistory(val) {

		debugger;
		showHistoryScreen.value = val;
	}

	init();

})();