jsPsych.plugins["affect-grid"] = (function () {

	var plugin = {};

	plugin.info = {
		name: 'affect-grid',
		description: '',
		parameters: {
			grid_square_size: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Grid square size',
				default: 50,
				description: 'The width and height in pixels of each square in the grid.'
			},
			response_ends_trial: {
				type: jsPsych.plugins.parameterType.BOOL,
				pretty_name: 'Response ends trial',
				default: false,
				description: 'If true, the trial ends after a mouse click.'
			},
			trial_duration: {
				type: jsPsych.plugins.parameterType.INT,
				pretty_name: 'Trial duration',
				default: null,
				description: 'How long to show the trial'
			},
			prompt: {
				type: jsPsych.plugins.parameterType.STRING,
				pretty_name: 'Prompt',
				default: null,
				description: 'Any content here will be displayed below the stimulus'
			},
			custom_label: {
				type: jsPsych.plugins.parameterType.BOOL,
				pretty_name: 'custom_label',
				default: false
			},
			label_name: {
				type: jsPsych.plugins.parameterType.FUNCTION,
				pretty_name: 'label_name',
				default: {
					high: " ",
					low: " ",
					pleasant: " ",
					unpleasant: " ",
					stress: " ",
					excitement: " ",
					depression: " ",
					relaxation: " "
				}
			},
			rated_stimulus: {
				type: jsPsych.plugins.parameterType.HTML_STRING,
				pretty_name: 'rated_stimulus',
				default: 'undefined',
				description: 'Any content here will be displayed above the grid'
			}
		}
	};

	plugin.trial = function (display_element, trial) {
		var startTime = -1;
		var response = {
			rt: null,
			row: null,
			column: null
		};

		if (!trial.custom_label) {
			this.axis = {
				arousal: "High arousal",
				sleepiness: "Sleepiness",
				pleasant: "Pleasant<br>Feelings",
				unpleasant: "Unpleasant<br>Feelings",
				stress: "Stress",
				excitement: "Excitement",
				depression: "Depression",
				relaxation: "Relaxation"
			};
		} else {
			var defo = {
				arousal: " ",
				sleepiness: " ",
				pleasant: " ",
				unpleasant: " ",
				stress: " ",
				excitement: " ",
				depression: " ",
				relaxation: " "
			};
			this.axis = Object.assign(defo, trial.label_name);
		}

		display_element.innerHTML = this.stimulus(trial.grid_square_size);

		if (trial.rated_stimulus !== 'undefined') {
			display_element.insertAdjacentHTML('afterbegin', trial.rated_stimulus);
		}
		if (trial.prompt !== null) {
			display_element.insertAdjacentHTML('beforeend', trial.prompt);
		}

		var submitBtn = document.createElement('button');
		submitBtn.textContent = "提出";
		submitBtn.style.display = "block";
		submitBtn.style.margin = "20px auto";
		submitBtn.style.fontSize = "18px";
		submitBtn.disabled = true;
		display_element.appendChild(submitBtn);

		var selectedCell = null;
		var resp_targets = display_element.querySelectorAll('.jspsych-affect-grid-stimulus-cell');
		resp_targets.forEach(function (cell) {
			cell.addEventListener('mousedown', function (e) {
				resp_targets.forEach(c => c.style.backgroundColor = 'white');
				cell.style.backgroundColor = 'red';
				selectedCell = cell;
				submitBtn.disabled = false;
				response.row = parseInt(cell.getAttribute('data-row'));
				response.column = parseInt(cell.getAttribute('data-column'));
				response.rt = performance.now() - startTime;
			});
		});

		startTime = performance.now();

		submitBtn.addEventListener('click', function () {
			if (selectedCell) {
				var trial_data = {
					rt: response.rt,
					stimulus: trial.rated_stimulus,
					arousal: 10 - (response.row + 1),
					pleasantness: response.column + 1
				};

				// CSVを即時ダウンロード
				var csv = "arousal,pleasantness,rt\n" + trial_data.arousal + "," + trial_data.pleasantness + "," + Math.round(trial_data.rt) + "\n";
				var blob = new Blob([csv], { type: 'text/csv' });
				var url = URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				a.download = 'affect_grid_data.csv';
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);

				display_element.innerHTML = '';
				jsPsych.finishTrial(trial_data);
			}
		});
	};

	plugin.stimulus = function (square_size, labels) {
		var stimulus = "<div id='all_stm' style='display: table;'>";
		stimulus += "<div id='tbl' style='display: table; font-family: Times New Roman; line-height: normal;'>";
		stimulus += "<div id='tbl-row1' style='display: table-row;'>";
		stimulus += "<div id='tbl-stress' style='display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.stress + "</div>";
		stimulus += "<div id='tbl-arousal' style='display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.arousal + "</div>";
		stimulus += "<div id='tbl-excitement' style='display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.excitement + "</div></div>";
		stimulus += "<div id='tbl-row2' style='display: table-row;'>";
		stimulus += "<div id='tbl-unpleasant' style='display: table-cell; font-size:" + square_size / 2 + "px; vertical-align: middle;'>" + this.axis.unpleasant + "</div>";
		stimulus += "<div id='axis-2' style='display: table-cell;'><div id='jspsych-affect-grid-stimulus' style='margin: auto; display: table; table-layout: fixed; border-spacing:" + square_size / 4 + "px'>";
		for (var i = 0; i < 9; i++) {
			stimulus += "<div class='jspsych-affect-grid-stimulus-row' style='display:table-row;'>";
			for (var j = 0; j < 9; j++) {
				stimulus += "<div class='jspsych-affect-grid-stimulus-cell' data-row=" + i + " data-column=" + j + " style='width:" + square_size + "px; height:" + square_size + "px; display:table-cell; vertical-align:middle; text-align:center; cursor:pointer; font-size:" + square_size / 2 + "px; margin:15px; border:2px solid black; background-color:white;'></div>";
			}
			stimulus += "</div>";
		}
		stimulus += "</div></div>";
		stimulus += "<div id='tbl-pleasant' style='display: table-cell; font-size:" + square_size / 2 + "px; vertical-align: middle;'>" + this.axis.pleasant + "</div></div>";
		stimulus += "<div id='tbl-row3' style='display: table-row;'>";
		stimulus += "<div id='tbl-depression' style='display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.depression + "</div>";
		stimulus += "<div id='tbl-sleepness' style='display: table-cell; font-size:" + square_size / 2 + "px'>" + this.axis.sleepiness + "</div>";
		stimulus += "<div id='tbl-relaxation' style='display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.relaxation + "</div></div></div></div>";
		return stimulus;
	};

	return plugin;
})();



