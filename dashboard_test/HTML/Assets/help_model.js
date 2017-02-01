//detector template

//add output variable name below
var variableName = "help_model"

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

//initialize any custom global variables for this detector here
var prevStep = "";
var help_variables = {"lastAction": "null",
					  "lastActionTime": "",
					  "seenAllHints": {},
					  "lastHintLength": "",
					  "lastSenseOfWhatToDo": false
					 };
//TUNABLE PARAMETERS
var errorThreshold = 3; //currently arbitrary
var newStepThreshold = 3; //currently arbitrary
var familiarityThreshold = 0.4;
var senseOfWhatToDoThreshold = 0.6;
var hintIsHelpfulPlaceholder = true; //currently a dummy value (assumption that hint is always helpful...)

//non-controversial
function lastActionIsHint(e){
	if (help_variables.lastAction == "hint"){return true;}
	else{return false;}
}
function lastActionIsError(e){
	if (help_variables.lastAction == "error"){return true;}
	else{return false;}
}
function seenAllHintLevels(e){
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "hint"){
		if (e.data.tutor_data.selection in help_variables.seenAllHints){
			return help_variables.seenAllHints[e.data.tutor_data.selection];
		}
		else{return false;}
	}
	else{
		if (e.data.tool_data.selection in help_variables.seenAllHints){
			return help_variables.seenAllHints[e.data.tool_data.selection];
		}
		else{return false;}
	}
}
function isCorrect(e){
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "correct"){return true;}
	else{return false;}
}

function secondsSinceLastAction(e){
	var currTime = new Date();
	diff = currTime.getTime() - help_variables.lastActionTime.getTime();
	console.log("time elapsed: ", diff/1000)
	return (diff / 1000);
}

//less controversial
function isDeliberate(e){
	var hintThreshold = (help_variables.lastHintLength/600)*60;

	if (lastActionIsError(e)){
		return (secondsSinceLastAction(e) > errorThreshold);
	}
	else if (lastActionIsHint(e)){
		return (secondsSinceLastAction(e) > hintThreshold);
	}
	else{
		return (secondsSinceLastAction(e) > newStepThreshold);
	}
}

//more controversial...
function isFamiliar(e){
	var rawSkills = e.data.tutor_data.skills;
	for (var property in rawSkills) {
	    if (rawSkills.hasOwnProperty(property)) {
	        if (parseFloat(rawSkills[property].pKnown)<=familiarityThreshold){
	        	return false;
	        }
	    }
	}
	return true;
}

function hintIsHelpful(e){
	return hintIsHelpfulPlaceholder;
}
function lastActionUnclearFix(e){
	if (help_variables.lastSenseOfWhatToDo == false){return true;}
	else{return false;}
}
function senseOfWhatToDo(e){
	var sel = e.data.tutor_data.selection;
	var rawSkills = e.data.tutor_data.skills;
	for (var property in rawSkills) {
	    if (rawSkills.hasOwnProperty(property)) {
	        if (parseFloat(rawSkills[property].pKnown)<=senseOfWhatToDoThreshold){
	        	return false;
	        }
	    }
	}
	return true;
}

//evaluation of each step
function evaluateAction(e){
	var sel = e.data.tutor_data.selection;
	var outcome = e.data.tutor_data.action_evaluation.toLowerCase();

	if (e.data.tutor_data.action_evaluation.toLowerCase() == "hint"){
		console.log("isHint")
		if (isDeliberate(e)){
			console.log("isDeliberate")
			if (!seenAllHintLevels(e) &&
				(!isFamiliar(e) 
				|| (lastActionIsError(e) && lastActionUnclearFix(e)) 
				|| (lastActionIsHint(e) && !hintIsHelpful(e))) ){
				return "preferred/ask hint";
			}
			else if ( (isFamiliar(e) && !senseOfWhatToDo(e) ) 
					|| (lastActionIsHint(e)) ){
				return "acceptable/ask hint";
			}
			else{
				return "not acceptable/hint abuse";
			}
		}
		else{
		console.log("not deliberate")
			return "not acceptable/hint abuse";
		}

	}
	else{
		if ( (isFamiliar(e) && (!(lastActionIsError(e) && lastActionUnclearFix(e))) )
			|| (lastActionIsHint(e) && hintIsHelpful(e))
			 ){
			return "preferred/try step";
		}
		else if (seenAllHintLevels(e) && 
			     (!(lastActionIsError(e) && lastActionUnclearFix(e))) ){
			return "preferred/try step";
		}
		else if (isCorrect(e)){
			return "acceptable/try step";
		}
		else if (seenAllHintLevels(e)){
			if (lastActionIsError(e) && lastActionUnclearFix(e)){
				return "ask teacher for help/try step";
			}
		}
		else{
			return "not acceptable/hint avoidance";
		}
	}

}

function updateHistory(e){
	help_variables.lastActionTime = new Date();
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "hint"){
		help_variables.lastAction = "hint";
		help_variables.lastHintLength = e.data.tutor_data.tutor_advice.split(' ').length;
		if (help_variables.seenAllHints[e.data.tutor_data.selection] != true){
			help_variables.seenAllHints[e.data.tutor_data.selection] = (e.data.tutor_data.current_hint_number == e.data.tutor_data.total_hints_available);
		}
	}
	if (e.data.tutor_data.action_evaluation.toLowerCase() == "incorrect"){
		help_variables.lastAction = "error";
	}

	help_variables.lastSenseOfWhatToDo = senseOfWhatToDo(e);

}

//TO-DO: 
// detector initialiization, and leave comment
// showing user how not to initialize (or, if we decide to
// initialize all detector variables by default, at startup...
// I suppose this would mean showing user how to clear initialized
// values upon the first transaction received?)


function receive_transaction( e ){
	//e is the data of the transaction from mailer from transaction assembler

	//TEST CODE
	//console.log("in detector1 with data:");
	//console.log(e.data);

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
		if (help_variables.lastAction!="null"){
			detector_output.value = evaluateAction(e);
		}
		else{
			detector_output.value = "preferred"; //may want to change this... currently means that the first action in any problem is always preferred
		}
		updateHistory(e);
		detector_output.history = help_variables;
	}

	//set conditions under which detector should update
	//external state and history
	if(e.data.actor == 'student' && e.data.tool_data.action != "UpdateVariable"){
		detector_output.time = new Date();
		detector_output.transaction_id = e.data.transaction_id;
		mailer.postMessage(detector_output);
		postMessage(detector_output);
		console.log("output_data = ", detector_output);
	}
}


self.onmessage = function ( e ) {
    console.log(variableName, " self.onmessage:", e, e.data, (e.data?e.data.commmand:null), (e.data?e.data.transaction:null), e.ports);
    switch( e.data.command )
    {
    case "connectMailer":
	mailer = e.ports[0];
	mailer.onmessage = receive_transaction;
	break;
    default:
	break;
    }
}