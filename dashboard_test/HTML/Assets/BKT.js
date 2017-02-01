//detector template

//add output variable name below
var variableName = "BKT"

//initializations (do not touch)
var detector_output = {name: variableName,
						category: "Dashboard", 
						value: "",
						history: {},
						skill_names: "",
						step_id: "",
						transaction_id: "",
						time: ""
						};
var mailer;

//initialize any custom global variables for this detector here
var prevStep = "";
var BKTparams = {p_transit: 0.2, 
				p_slip: 0.1, 
				p_guess: 0.2, 
				p_know: 0.3};
var pastSteps = {};

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


//TO-DO: 
// detector initialiization, and leave comment
// showing user how not to initialize (or, if we decide to
// initialize all detector variables by default, at startup...
// I suppose this would mean showing user how to clear initialized
// values upon the first transaction received?)


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
		var currStep = e.data.tool_data.selection;
		for (var i in currSkills){
			var skill = currSkills[i];

			if(!(currStep in pastSteps)){
				if (!(skill in detector_output.history)){	//if this skill has not been encountered before
					detector_output.history[skill] = clone(BKTparams);
				}

				var p_know_tminus1 = detector_output.history[skill]["p_know"];
				var p_slip = detector_output.history[skill]["p_slip"];
				var p_guess = detector_output.history[skill]["p_guess"];
				var p_transit = detector_output.history[skill]["p_transit"];

				console.log(detector_output.history[skill]["p_know"]);


				if (e.data.tutor_data.action_evaluation.toLowerCase()=="correct"){
					var p_know_given_obs = (p_know_tminus1*(1-p_slip))/( (p_know_tminus1*(1-p_slip)) + ((1-p_know_tminus1)*p_guess) );
				}
				else{
					var p_know_given_obs = (p_know_tminus1*p_slip)/( (p_know_tminus1*p_slip) + ((1-p_know_tminus1)*(1-p_guess)) );
				}
				
				detector_output.history[skill]["p_know"] = p_know_given_obs + (1 - p_know_given_obs)*p_transit;

				console.log("engine BKT: ", e.data.tutor_data.skills[0].pKnown);
				console.log(detector_output.history[skill]["p_know"]);
			}

		}

		//update # of attempts at step
		if(!(currStep in pastSteps)){
			pastSteps[currStep] = true;
		}

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