//
//*assume transactions are grouped by student*
//

//user-determined parameters
detector_list = ["currentAttemptCount.js", "help_model.js", "help_model_try_if_low.js"];


//declare global variables (e.g., BKT params and data structures)
//
//
//
//


//open all detectors in detector_list as WebWorkers
//
//   set up event listeners so that any time we receive 
//   an update, 
//

//need to include BKT here
function BKT(e){

}

// problem reset upon a:
//  problem change event:
//  	'done / correct' event,
//   	when problem attempt changes, on the same problem
//  student change event:
//		upon encountering a new student,
function simulateNewProblemOrStudent(){
}

//convert transaction to JSON format in which detectors
//  would typically receive transactions
function constructTransaction(e){

	//BKT update...

	//construct JSON message and return JSON
	
}

//test detectors on historical data (this function acts on one row)
function simulateDataStream(e, parser){

	//for each row e in a DataShop export, construct a JSON transaction...
	var t = constructTransaction(e.data[0]);

	//based on t...
	// problem reset upon a:
	//  - problem change event:
	//  	'done / correct' event,
	//   	when problem attempt changes, on the same problem
	//  - student change event:
	//		upon encountering a new student,
	if //... {
		simulateNewProblemOrStudent();

	//}

	//for every detector in detector_list...
		//post to detector
		//
		//
		//

}
