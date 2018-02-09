var variableName = "gaming"

//initializations (do not touch)
var detector_output = {name: variableName,
						category: "Dashboard",
						value: 0,
						history: "",
						skill_names: "",
						step_id: "",
						transaction_id: "",
						time: ""
						};
var mailer;


//declare any custom global variables that will be initialized
//based on "remembered" values across problem boundaries, here
// (initialize these at the bottom of this file, inside of self.onmessage)
//
//
//
//
//

//declare and/or initialize any other custom global variables for this detector here...
var action_type = Object.freeze({
	STEP_ATTEMPT: "Step attempt",
	HELP: "Help request"
});

// In CTAT actions are labeled as correct or incorrect, but we use
// right and wrong to be consistent with previous implementation.
var action_assessment = Object.freeze({
	RIGHT: "Right",
	WRONG: "Wrong",
	BUG: "Bug"
});

var interpretation_element = Object.freeze({
	SWITCHED_CONTEXT_BEFORE_RIGHT: "Switched context before right",
	DID_NOT_SWITCH_CONTEXT: "Did not switch context",
	DID_NOT_THINK_BEFORE_HELP_REQUEST: "Did not think before help request",
	THOUGHT_BEFORE_HELP_REQUEST: "Thought before help request",
	THOUGHT_BEFORE_STEP_ATTEMPT: "Thought before step attempt",
	SEARCHING_FOR_BOTTOM_OUT_HINT: "Searching for bottom out hint",
	GUESSING_STEP: "Guessing step",
	REPEATED_STEP: "Repeated step",
	NOT_REPEATED_STEP: "Not repeated step",
	READING_HELP_MESSAGE: "Reading help message",
	SCANNING_HELP_MESSAGE: "Scanning help message",
	SEARCHING_FOR_BOTTOM_OUT_HINT: "Searching for bottom out hint",
	THOUGHT_ABOUT_DURING_LAST_STEP: "Thought about during last step",
	THOUGHT_ABOUT_STEP_BUT_FLAW_IN_PROCEDURE: "Thought about step but flow in procedure",
	GUESSING_STEP_WITH_VALUES_FROM_PROBLEM: "Guessing step with values from problem",
	READ_ERROR_MESSAGE: "Read error message",
	DID_NOT_READ_ERROR_MESSAGE: "Did not read error message",
	THOUGHT_ABOUT_ERROR: "Thought about error",
	SAME_ANSWER_DIFFERENT_CONTEXT: "Same answer different context",
	SAME_ANSWER_SAME_CONTEXT_DIFFERENT_ACTION: "Same answer same context different action",
	SIMILAR_ANSWER_INPUTS: "Similar answer inputs"
});

var behavior = Object.freeze({
	GAMING: "Gaming",
	NOT_GAMING: "Not gaming"
})

// Clip is an array of actions. Each action is in a format:
//  {
// 	  cell: cell student interacted with or null,
// 	  timestamp: time when action occured in seconds,
// 	  time: time elapsed since the previous action occurred,
// 	  type: step attempt or help request,
// 	  assessment: right, wrong or bug (only for step attempts, null otherwise),
// 	  num_steps: number of help requests when collapsed into one action,
// 	  answer: students input (when applicable, null otherwise),
// 	  interpretation_before: list of interpretation elements,
// 	  interpretation_after: list of interpretation elements
//  }
var clip = [];
var ended_with_help = false;
//
//
//
//
//[optional] single out TUNABLE PARAMETERS below
var clip_size = 5


function receive_transaction( e ) {
	
	//e is the data of the transaction from mailer from transaction assembler
	
	var updateExternalState = false;

	//set conditions under which transaction should be processed
	//(i.e., to update internal state and history, without
	//necessarily updating external state and history)
	if(e.data.actor == 'student' && e.data.tool_data.action != "UpdateVariable"){
		//do not touch
		rawSkills = e.data.tutor_data.skills
		var currSkills = []
		for (var property in rawSkills) {
		    if (rawSkills.hasOwnProperty(property)) {
		        currSkills.push(rawSkills[property].name + "/" + rawSkills[property].category)
		    }
		}
		detector_output.skill_names = currSkills;
		detector_output.step_id = e.data.tutor_data.step_id;

		//custom processing (insert code here)
		var action = get_action(e);
		var i = clip.length;
		var detect_patterns = true;

		// wait for first non-help actions
		if (i === 0 && ended_with_help && isHelp(action)) {
			detector_output.value = behavior.NOT_GAMING;
			detect_patterns = false;
		}

		// collapse help requests into 1 action
		if (isHelp(action) && i > 0 && isHelp(clip[i - 1])) {
			collapseHelpRequests(clip[i - 1], action);
			detector_output.value = behavior.NOT_GAMING;
			detect_patterns = false;
		}

		if (detect_patterns) {
			generateInterpretation(action);
			clip.push(action);
			i += 1;
			if (i === clip_size) {
				// the clip is complete, so look for gaming patterns
				detector_output.value = generateDiagnosis(clip);
				clip = [];
				ended_with_help = isHelp(action);
				
				updateExternalState = true;
			} else {
				// Only detect patterns when the clip is complete,
				// otherwise set to default (NOT GAMING)
				detector_output.value = behavior.NOT_GAMING;
			}
		}
	}

	//set conditions under which detector should update
	//external state and history
	if(updateExternalState && e.data.actor == 'student' && e.data.tool_data.action != "UpdateVariable") {
		if (offlineMode == false) {
			detector_output.time = new Date();
		} else {
			detector_output.time = new Date(e.data.tool_data.tool_event_time);
		}
		detector_output.transaction_id = e.data.transaction_id;
		if (offlineMode == false) {
			mailer.postMessage(detector_output);
		}
		postMessage(detector_output);
		console.log("output_data = ", detector_output);
	}
}

var numRowsReceived = 0;
var numRowsProcessed = 0;
var offlineMode = false;

self.onmessage = function ( e ) {
    //console.log(variableName, " self.onmessage:", e, e.data, (e.data?e.data.commmand:null), (e.data?e.data.transaction:null), e.ports);
    switch( e.data.command )
    {
	case "offlineMode":
    	//console.log(e.data.message);
    	offlineMode = true;
    	numRowsReceived++;
    	receive_transaction({data: e.data.message});
    	numRowsProcessed++;
    break;
    case "offlineNewProblem":
    	console.log("new problem!");
		clip = []
    	detector_output.history = "";
		detector_output.value = behavior.NOT_GAMING;
    break;
    case "offlineNewStudent":
    	console.log("new student!");
		clip = []
    	detector_output.category = e.data.studentId;
    	detector_output.history = "";
		detector_output.value = behavior.NOT_GAMING;
		initTime = "";
    break;
    case "endOfOfflineMessages":
    	setInterval(function() {
    		if (numRowsReceived === numRowsProcessed) {
    			postMessage("readyToTerminate");
    		}
    	},200);
    break;
    case "connectMailer":
		mailer = e.ports[0];
		mailer.onmessage = receive_transaction;
	break;
	case "initialize":
		for (initItem in e.data.initializer){
			if (e.data.initializer[initItem].name == variableName){
				detector_output.history = e.data.initializer[initItem].history;
				detector_output.value = e.data.initializer[initItem].value;
			}
		}


		//optional: In "detectorForget", specify conditions under which a detector
		//should NOT remember their most recent value and history (using the variable "detectorForget").
		//(e.g., setting the condition to "true" will mean that the detector
		// will always be reset between problems... and setting the condition to "false"
		// means that the detector will never be reset between problems)
		//
		detectorForget = false;
		//
		//

		if (detectorForget){
			detector_output.history = "";
			detector_output.value = 0;
		}


		//optional: If any global variables are based on remembered values across problem boundaries,
		// these initializations should be written here
		//
		//
		if (detector_output.history == "" || detector_output.history == null){
			//in the event that the detector history is empty,
			//initialize variables to your desired 'default' values
			//
			//
		}
		else{
			//if the detector history is not empty, you can access it via:
			//     JSON.parse(detector_output.history);
			//...and initialize your variables to your desired values, based on
			//this history
			//
			//
		}

	break;
    default:
	break;

    }

}

function get_action(e) {
	var type;
	var date;
	var timestamp;
	var lastAction = getLastAction();
	var action_eval = e.data.tutor_data.action_evaluation.toLowerCase()
	var tutor_advice = e.data.tutor_data.tutor_advice
	var assessment;

	type = action_eval === "hint" ? action_type.HELP : action_type.STEP_ATTEMPT;
	if (type == action_type.STEP_ATTEMPT) {
		if (action_eval === "correct") {
			assessment = action_assessment.RIGHT;
		} else if (action_eval === "incorrect") {
			if (tutor_advice != "") {
				assessment = action_assessment.BUG;
			} else {
				assessment = action_assessment.WRONG;
			}
		} else {
			assessment = null;
		}
	} else {
		assessment = null;
	}
	date = new Date();
	timestamp_seconds = date.getTime() / 1000;
	time = lastAction !== null ? timestamp_seconds - lastAction.timestamp : null;

	return {
		cell: e.data.tool_data.selection,
		action: e.data.tool_data.action,
		timestamp: timestamp_seconds,
		time: time,
		type: type,
		assessment: assessment,
		num_steps: 1,
		answer: e.data.tool_data.input,
		interpretation_before: [],
		interpretation_after: []
	}
}

function isRight(action) {
	return (action.type === action_type.STEP_ATTEMPT &&
				  action.assessment === action_assessment.RIGHT)
}

function isWrong(action) {
	return (action.type === action_type.STEP_ATTEMPT &&
				  action.assessment === action_assessment.WRONG)
}

function isBug(action) {
	return (action.type === action_type.STEP_ATTEMPT &&
				  action.assessment === action_assessment.BUG)
}

function isStep(action) {
	return (action.type === action_type.STEP_ATTEMPT);
}

function isHelp(action) {
	return action.type === action_type.HELP;
}

function addInterpretationBefore(action, element) {
	action.interpretation_before.push(element);
}

function addInterpretationAfter(action, element) {
	action.interpretation_after.push(element);
}

function hasInterpretation(action, interpretation) {
	return action.interpretation_before.includes(interpretation) ||
				 action.interpretation_after.includes(interpretation)
}

function isSameCell(action1, action2) {
	return action1.cell === action2.cell;
}

function isSameAnswer(action1, action2) {
	return action1.answer === action2.answer;
}

function isSameAction(action1, action2) {
	return action1.action === action2.action;
}

function getLastAction() {
	if (clip.length > 0) {
		return clip[clip.length - 1];
	} else {
		return null;
	}
}

function collapseHelpRequests(lastAction, action) {
	lastAction.timestamp = action.timestamp;
	lastAction.time += action.time;
	lastAction.num_steps += 1;
}

function getInterpretationBeforeHelpRequest(action) {
	if (action.time < 5) {
		return interpretation_element.DID_NOT_THINK_BEFORE_HELP_REQUEST;
	} else {
		return interpretation_element.THOUGHT_BEFORE_HELP_REQUEST;
	}
}

function getInterpretationAfterHelpRequest(currentAction, nextAction) {
	var totalTime = nextAction.time;
	var timePerHelpRequest = totalTime / currentAction.num_steps;

	if (timePerHelpRequest > 8) {
		return interpretation_element.READING_HELP_MESSAGE;
	} else if (timePerHelpRequest > 3) {
		return interpretation_element.SCANNING_HELP_MESSAGE;
	} else {
		return interpretation_element.SEARCHING_FOR_BOTTOM_OUT_HINT;
	}
}

function getInterpretationBeforeStepAttempt(currentAction, previousAction, previousActionIsFirstOfClip) {
	if (currentAction.time > 5) {
		return interpretation_element.THOUGHT_BEFORE_STEP_ATTEMPT;
	} else if (!previousActionIsFirstOfClip && previousAction.time > 10 &&
					   isStep(previousAction) && !isSameCell(previousAction, currentAction) &&
					   isRight(previousAction)) {
		// If this action is the first of the clip, the expert can't see the time before that action
		// For now we only consider that the student can think one step ahead if he the previous
		// action was a step attempt in a different cell
	  return interpretation_element.THOUGHT_ABOUT_DURING_LAST_STEP;
  } else {
		return interpretation_element.GUESSING_STEP;
	}
}

function getInterpretationBeforeBug(currentAction) {
	if (currentAction.time > 5) {
		return interpretation_element.THOUGHT_ABOUT_STEP_BUT_FLAW_IN_PROCEDURE;
	} else {
		return interpretation_element.GUESSING_STEP_WITH_VALUES_FROM_PROBLEM;
	}
}

function getInterpretationAfterBug(currentAction, nextAction) {
	var timeAfter = nextAction.time;
	if (timeAfter > 8) {
		return interpretation_element.READ_ERROR_MESSAGE;
	} else {
		return interpretation_element.DID_NOT_READ_ERROR_MESSAGE;
	}
}

function getInterpretationAfterStepAttempt(currentAction, nextAcion) {
	var timeAfter = nextAcion.time;

	if (timeAfter > 5) {
		return interpretation_element.THOUGHT_ABOUT_ERROR;
	} else {
		return null;
	}
}

function getSimilarityInterpretation(currentAttempt, previousAttempt) {
	if (!isStep(previousAttempt)) {
		return null;
	}

	if (isSameAnswer(previousAttempt, currentAttempt)) {
		if (isSameCell(previousAttempt, currentAttempt)) {
			if(isSameAction(previousAttempt, currentAttempt)) {
				return interpretation_element.REPEATED_STEP;
			} else {
				return interpretation_element.SAME_ANSWER_SAME_CONTEXT_DIFFERENT_ACTION;
			}
		} else {
			return interpretation_element.SAME_ANSWER_DIFFERENT_CONTEXT;
		}
	} else if (levenshteinDistance(previousAttempt.answer, currentAttempt.answer) <= 2) {
		return interpretation_element.SIMILAR_ANSWER_INPUTS;
	}

	return null;
}



function generateInterpretation(action) {
	var i = clip.length;

	// If this is not the first action, check to see whether the cell changed.
	// If the cell changed and the previous action was not a correct step, than the student possibly "abandonned the step"
	if (i > 0) {
		var lastAction = getLastAction();
		if (!isSameCell(action, lastAction)) {
			if (!isRight(lastAction)) {
				//TODO CognitiveModel.java line 67: should we check if action.assessment == RIGHT?
				addInterpretationBefore(action, interpretation_element.SWITCHED_CONTEXT_BEFORE_RIGHT);
			}
		} else {
			addInterpretationBefore(action, interpretation_element.DID_NOT_SWITCH_CONTEXT);
		}
	}

	if (isHelp(action)) {
		if (i > 0) {
			var element = getInterpretationBeforeHelpRequest(action);
			if (element) {
				addInterpretationBefore(action, element);
			}
		}
	}

	// Generate interprerations after help reauests.
	// If the previuos action was a help request, check whether the student
	// spent enough time to read the hints.
	if (i > 0) {
		var lastAction = getLastAction();
		if (isHelp(lastAction)) {
			var element = getInterpretationAfterHelpRequest(lastAction, action);
			if (element) {
				addInterpretationAfter(lastAction, element);
			}
		}
	}

	if (isStep(action)) {
		// If it's not the first action of the clip, see if there is enough time before the action to think about the step
		if (i > 0) {
			var lastAction = getLastAction();
			if (hasInterpretation(lastAction, interpretation_element.SEARCHING_FOR_BOTTOM_OUT_HINT)) {
				addInterpretationBefore(action, interpretation_element.GUESSING_STEP)
			} else {
				var element = getInterpretationBeforeStepAttempt(action, lastAction, i === 1);
				if (element) {
					addInterpretationBefore(action, element);
				}
			}
		}

		if (i > 0) {
			var lastAction = getLastAction();
			var element = getSimilarityInterpretation(action, lastAction);
			if (element) {
				addInterpretationBefore(action, element);
			}
			if (element !== interpretation_element.REPEATED_STEP) {
				addInterpretationBefore(action, interpretation_element.NOT_REPEATED_STEP);
			}
		}

		var assessment = action.assessment;
		if (assessment === action_assessment.BUG) {
			if (i > 0) {
				var element = getInterpretationBeforeBug(action);
				if (element) {
					addInterpretationBefore(action, element);
				}
			}
		}
	}

	// Generate interprerations after step attempts (for previuos action)
	if (i > 0) {
		var lastAction = getLastAction();
		if (isStep(lastAction)) {
			if (lastAction.assessment === action_assessment.BUG) {
				var element = getInterpretationAfterBug(lastAction, action);
				if (element) {
					addInterpretationAfter(lastAction, element);
				}
			}

			if (lastAction.assessment !== action_assessment.RIGHT) {
				var element = getInterpretationAfterStepAttempt(lastAction, action);
				if (element) {
					addInterpretationAfter(lastAction, element);
				}
			}
		}
	}

	return action;
}

function generateDiagnosis(clip) {
	var targetedPattern = false;

	for (i = 0; i < clip.length; i++) {
		if (i > 0) {
			var firstAction = clip[i - 1];
			var secondAction = clip[i];

			if (isSameWrongAnswerDifferentContextPattern(firstAction, secondAction)) {
				targetedPattern = true;
			}
		}

		if (i > 1) {
			var firstAction = clip[i - 2];
			var secondAction = clip[i - 1];
			var thirdAction = clip[i];

			if (isRepeatedSimilarAnswers(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isNotRightSimilarNotRightSameAnswerDiffContext(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isRepeatedWrongGuessesPattern(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isNotRightSimilarNotRightGuess(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isBottomOutNotRightSimilarNotRight(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isNotRightSameDiffNotRightContextSwitch(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isBugSameDiffRightBug(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}

			if (isRepeatedNotRightOneSimilarOneSwitchContext(firstAction, secondAction, thirdAction)) {
				targetedPattern = true;
			}
		}

		if (i > 2) {
			var firstAction = clip[i - 3];
			var secondAction = clip[i - 2];
			var thirdAction = clip[i - 1];
			var fourthAction = clip[i];

			if (isNotRightSimilarNotRightQuickHelpNotRight(firstAction, secondAction, thirdAction, fourthAction)) {
				targetedPattern = true;
			}

			if (isHelpRepeatedNotRightOneSimilar(firstAction, secondAction, thirdAction, fourthAction)) {
				targetedPattern = true;
			}

			if (isRepeatedNotRightOneSimilarQuickHelp(firstAction, secondAction, thirdAction, fourthAction)) {
				targetedPattern = true;
			}
		}
	}

	if (targetedPattern) {
		return behavior.GAMING;
	} else {
		return behavior.NOT_GAMING;
	}
}



function isSearchingForBottomOutHint(action) {
	if (!isHelp(action)) {
		return false;
	}
	if(!hasInterpretation(action, interpretation_element.SEARCHING_FOR_BOTTOM_OUT_HINT)) {
		return false;
	}

	return true;
}

function isSameWrongAnswerDifferentContextPattern(firstAction, secondAction) {
	if (!isStep(firstAction) || !isStep(secondAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.GUESSING_STEP)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SAME_ANSWER_DIFFERENT_CONTEXT)) {
		return false;
	}
	
	return true;
}

function isRepeatedSimilarAnswers(firstAction, secondAction, thirdAction) {
	// Searching for the following pattern:
	// Not right -> similar answer -> not right -> similar answer

	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {
		return false;
	}

	// Make sure that the context didn't switch
	if (hasInterpretation(secondAction, interpretation_element.SWITCHED_CONTEXT_BEFORE_RIGHT) ||
			hasInterpretation(thirdAction, interpretation_element.SWITCHED_CONTEXT_BEFORE_RIGHT)) {

		return false;
	}

	return true;
}

function isNotRightSimilarNotRightSameAnswerDiffContext(firstAction, secondAction, thirdAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.SAME_ANSWER_DIFFERENT_CONTEXT)) {
		return false;
	}

	return true;
}

function isRepeatedWrongGuessesPattern(firstAction, secondAction, thirdAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction)) {
		return false;
	}

	if (!hasInterpretation(firstAction, interpretation_element.GUESSING_STEP) ||
			!hasInterpretation(secondAction, interpretation_element.GUESSING_STEP) ||
			!hasInterpretation(thirdAction, interpretation_element.GUESSING_STEP)) {

		return false;
	}

	if (hasInterpretation(secondAction, interpretation_element.REPEATED_STEP) ||
			hasInterpretation(thirdAction, interpretation_element.REPEATED_STEP)) {

		return false;
	}

	return true;
}

function isNotRightSimilarNotRightGuess(firstAction, secondAction, thirdAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.GUESSING_STEP)) {
		return false;
	}

	return true;
}

function isBottomOutNotRightSimilarNotRight(firstAction, secondAction, thirdAction) {
	if (!isHelp(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(secondAction) || isRight(thirdAction)) {
		return false;
	}

	if (!hasInterpretation(firstAction, interpretation_element.SEARCHING_FOR_BOTTOM_OUT_HINT)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {
		return false;
	}

	return true;
}

function isNotRightSameDiffNotRightContextSwitch(firstAction, secondAction, thirdAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SAME_ANSWER_DIFFERENT_CONTEXT)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.SWITCHED_CONTEXT_BEFORE_RIGHT)) {
		return false;
	}

	return true;
}


function isBugSameDiffRightBug(firstAction, secondAction, thirdAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (!isBug(firstAction) || !isRight(secondAction) || !isBug(thirdAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SAME_ANSWER_DIFFERENT_CONTEXT)) {
		return false;
	}

	return true;
}

function isRepeatedNotRightOneSimilarOneSwitchContext(firstAction, secondAction, thirdAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction) || isRight(thirdAction)) {
		return false;
	}

	if ((!hasInterpretation(secondAction, interpretation_element.SIMILAR_ANSWER_INPUTS) ||
	     !hasInterpretation(thirdAction, interpretation_element.SWITCHED_CONTEXT_BEFORE_RIGHT)) &&
		  (!hasInterpretation(thirdAction, interpretation_element.SIMILAR_ANSWER_INPUTS) ||
		   !hasInterpretation(secondAction, interpretation_element.SWITCHED_CONTEXT_BEFORE_RIGHT))) {

		return false;
	}

	return true;
}

function isNotRightSimilarNotRightQuickHelpNotRight(firstAction, secondAction, thirdAction, fourthAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isHelp(thirdAction) || !isStep(fourthAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction) || isRight(fourthAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.DID_NOT_THINK_BEFORE_HELP_REQUEST)) {
		return false;
	}

	var firstAnswer = firstAction.answer;
	var secondAnswer = secondAction.answer;
	var fourthAnswer = fourthAction.answer;

	if ((levenshteinDistance(firstAnswer, fourthAnswer) > 2) &&
			(levenshteinDistance(secondAnswer, fourthAnswer) > 2)) {

	  return false;
	}

	return true;
}

function isHelpRepeatedNotRightOneSimilar(firstAction, secondAction, thirdAction, fourthAction) {
	if (!isHelp(firstAction) || !isStep(secondAction) || !isStep(thirdAction) || !isStep(fourthAction)) {
			return false;
	}

	if (isRight(secondAction) || isRight(thirdAction) || isRight(fourthAction)) {
		return false;
	}

	if (!hasInterpretation(thirdAction, interpretation_element.SIMILAR_ANSWER_INPUTS) &&
			!hasInterpretation(fourthAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {

		return false;
	}

	return true;
}

function isRepeatedNotRightOneSimilarQuickHelp(firstAction, secondAction, thirdAction, fourthAction) {
	if (!isStep(firstAction) || !isStep(secondAction) || !isStep(thirdAction) || !isHelp(fourthAction)) {
			return false;
	}

	if (isRight(firstAction) || isRight(secondAction) || isRight(thirdAction)) {
		return false;
	}

	if (!hasInterpretation(secondAction, interpretation_element.SIMILAR_ANSWER_INPUTS) &&
			!hasInterpretation(thirdAction, interpretation_element.SIMILAR_ANSWER_INPUTS)) {

		return false;
	}

	if (!hasInterpretation(fourthAction, interpretation_element.DID_NOT_THINK_BEFORE_HELP_REQUEST)) {
		return false;
	}

	return true;
}


// Taken from: http://en.wikibooks.org/wiki/Algorithm_Implementation/Strings/Levenshtein_distance#Java
function levenshteinDistance(str1, str2) {
  var distance = [];

  for(i = 0; i <= str1.length; i++) {
    var row = [];
    for(j = 0; j <= str2.length; j++) {
      row.push(0);
    }
    distance.push(row);
  }

  for(i = 0; i <= str1.length; i++) {
    distance[i][0] = i;
  }

  for(j = 1; j <= str2.length; j++) {
    distance[0][j] = j;
  }

  for(i = 1; i <= str1.length; i++) {
    for(j = 1; j <= str2.length; j++) {
      distance[i][j] = Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1,
                      distance[i - 1][j - 1]+ ((str1[i - 1] == str2[j - 1]) ? 0 : 1));

    }
  }

  return distance[str1.length][str2.length];
}

