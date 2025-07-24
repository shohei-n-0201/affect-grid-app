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
				default: true,
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
	}

	plugin.trial = function (display_element, trial) {
		var startTime = -1;
		var response = {
			rt: null,
			row: null,
			column: null
		}



		if (trial.custom_label == false) {
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
		} else if (trial.custom_label == true) {
			/*this.axis = trial.label_name*/
			var defo = {
				arousal: " ",
				sleepiness: " ",
				pleasant: " ",
				unpleasant: " ",
				stress: " ",
				excitement: " ",
				depression: " ",
				relaxation: " "
			}

			this.axis = Object.assign(defo, trial.label_name)
		}


		//display stimulus
		var stimulus = this.stimulus(trial.grid_square_size);
		display_element.innerHTML = stimulus;

		if (trial.rated_stimulus !== 'undefined') {
			display_element.insertAdjacentHTML('afterbegin', trial.rated_stimulus)
		}
		//show prompt if there is one
		if (trial.prompt !== null) {
			display_element.insertAdjacentHTML('beforeend', trial.prompt);
		}
		showTarget();

		function showTarget() {
			var resp_targets
			resp_targets = display_element.querySelectorAll('.jspsych-affect-grid-stimulus-cell');

			for (var i = 0; i < resp_targets.length; i++) {
				resp_targets[i].addEventListener('mousedown', function (e) {
					if (startTime == -1) {
						return;
					} else {
						var info = {}
						info.row = e.currentTarget.getAttribute('data-row');
						info.column = e.currentTarget.getAttribute('data-column');
						info.rt = performance.now() - startTime;
						after_response(info);
					}
				});
			}

			startTime = performance.now();

			if (trial.trial_duration !== null) {
				jsPsych.pluginAPI.setTimeout(function () {
					endTrial();
				}, trial.trial_duration);
			}
		}



		function endTrial() {

			// kill any remaining setTimeout handlers
			jsPsych.pluginAPI.clearAllTimeouts();

			// gather the data to store for the trial
			var trial_data = {
				rt: response.rt,
				stimulus: trial.rated_stimulus,
				arousal: 10 - (parseInt(response.row, 10) + 1),
				pleasantness: parseInt(response.column, 10) + 1
			};

			//clear the display
			display_element.innerHTML = '';

			// move on to the next trial
			jsPsych.finishTrial(trial_data);

		}

		//function to handle responses by the subject
		function after_response(info) {

			// only record first response
			response = response.rt == null ? info : response;

			if (trial.response_ends_trial) {
				endTrial();
			}
		};




	};

	plugin.stimulus = function (square_size, labels) {
		var stimulus = "<div id = all_stm style = 'display: table;'>"

		stimulus += "<div id = tbl style = 'display: table; font-family: Times New Roman; line-height: normal;'>"
		stimulus += "<div id = tbl-row1 style= 'display: table-row;'>"
		stimulus += "<div id = tbl-stress style= 'display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.stress + "</div>"
		stimulus += "<div id = tbl-arousal style= 'display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.arousal + "</div>"
		stimulus += "<div id = tbl-excitement style= 'display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.excitement + "</div></div>"
		stimulus += "<div id = tbl-row2 style = 'display: table-row;'>"
		stimulus += "<div id = tbl-unpleasant style= 'display: table-cell; font-size:" + square_size / 2 + "px;  vertical-align: middle;'>" + this.axis.unpleasant + "</div>"
		stimulus += "<div id = axis-2 style= 'display: table-cell;'><div id = 'jspsych-affect-grid-stimulus' style='margin: auto; display: table; table-layout: fixed; border-spacing:" + square_size / 4 + "px'>";
		for (var i = 0; i < 9; i++) {
			stimulus += "<div class='jspsych-affect-grid-stimulus-row' style='display:table-row;'>";
			for (var j = 0; j < 9; j++) {
				var classname = 'jspsych-affect-grid-stimulus-cell';

				stimulus += "<div class='" + classname + "' id='jspsych-affect-grid-stimulus-cell-" + i + "-" + j + "' " +
					"data-row=" + i + " data-column=" + j + " " +
					"style='width:" + square_size + "px; height:" + square_size + "px; display:table-cell; vertical-align:middle; text-align: center; cursor: pointer; font-size:" + square_size / 2 + "px; margin: 15px;";


				stimulus += "border: 2px solid black;"
				stimulus += "background-color: white;'>";
				if (typeof labels !== 'undefined' && labels[i][j] !== false) {
					stimulus += labels[i][j]
				}
				stimulus += "</div>";
			}
			stimulus += "</div>";
		}

		stimulus += "</div>";
		stimulus += "</div>";
		stimulus += "<div id = tbl-pleasant style= 'display: table-cell; font-size:" + square_size / 2 + "px;  vertical-align: middle;'>" + this.axis.pleasant + "</div>"
		stimulus += "</div>";
		stimulus += "<div id = tbl-row3 style = 'display: table-row;'>"
		stimulus += "<div id = tbl-depression style= 'display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.depression + "</div>"
		stimulus += "<div id = tbl-sleepness style= 'display: table-cell; font-size:" + square_size / 2 + "px'>" + this.axis.sleepiness + "</div>"
		stimulus += "<div id = tbl-relaxation style= 'display: table-cell; font-size:" + square_size / 2 + "px;'>" + this.axis.relaxation + "</div>"

		stimulus += "</div>";
		stimulus += "</div>";
		stimulus += "</div>";




		return stimulus
	}

	return plugin;
})();




