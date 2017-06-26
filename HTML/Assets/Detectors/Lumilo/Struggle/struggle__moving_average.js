//detector template

//add output variable name below
var variableName = "struggle"

//initializations (do not touch)
var detector_output = {name: variableName,
						category: "Dashboard", 
						value: "0, none",
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
var attemptWindow;

//declare and/or initialize any other custom global variables for this detector here
var attemptCorrect;
var windowSize = 7;
var threshold = 1;
var timerId; var timerId2; var timerId3; var timerId4; var timerId5;


function receive_transaction( e ){
	//e is the data of the transaction from mailer from transaction assembler

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
		//
		attemptCorrect = (e.data.tutor_data.action_evaluation.toLowerCase() == "correct") ? 1 : 0;
		attemptWindow.shift();
		attemptWindow.push(attemptCorrect);
		var sumCorrect = attemptWindow.reduce(function(pv, cv) { return pv + cv; }, 0);
		console.log(attemptWindow);
		
	}

	//set conditions under which detector should update
	//external state and history
	if(e.data.actor == 'student' && e.data.tool_data.action != "UpdateVariable"){
		detector_output.time = new Date();
		detector_output.transaction_id = e.data.transaction_id;

		//custom processing (insert code here)
		if (detector_output.value=="0, > 0 s" && (sumCorrect <= threshold)){
			detector_output.history = JSON.stringify(attemptWindow);
			detector_output.value = "1, > 25 s"
			detector_output.time = new Date();

			timerId = setTimeout(function() { 
		      detector_output.history = JSON.stringify(attemptWindow);
		      detector_output.value = "1, > 45 s"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      20000)
		    timerId2 = setTimeout(function() { 
		      detector_output.history = JSON.stringify(attemptWindow);
		      detector_output.value = "1, > 1 min"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      35000)
		    timerId3 = setTimeout(function() { 
		      detector_output.history = JSON.stringify(attemptWindow);
		      detector_output.value = "1, > 2 min"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      95000)
		    timerId4 = setTimeout(function() { 
		      detector_output.history = JSON.stringify(attemptWindow);
		      detector_output.value = "1, > 5 min"
		      detector_output.time = new Date();
			  mailer.postMessage(detector_output);
			  postMessage(detector_output);
			  console.log("output_data = ", detector_output);  }, 
		      275000)

		}
		else if (detector_output.value!="0, > 0 s" && (sumCorrect <= threshold)){
			detector_output.history = JSON.stringify(attemptWindow);
			detector_output.time = new Date();
		}
		else{
			detector_output.value = "0, > 0 s";
			detector_output.history = JSON.stringify(attemptWindow);
			detector_output.time = new Date();

			clearTimeout(timerId);
			clearTimeout(timerId2);
			clearTimeout(timerId3);
			clearTimeout(timerId4);
		}

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
		//
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
			attemptWindow = Array.apply(null, Array(windowSize)).map(Number.prototype.valueOf,1);
		}
		else{
			attemptWindow = JSON.parse(detector_output.history);
		}

	break;
    default:
	break;

    }

}