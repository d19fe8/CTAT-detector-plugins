/*
	For testing the dashboard.
	-Peter
*/

var messageIndex=0;			//Index of what message is currently running through tutor
var messages=[];			//Every message in class format
var schedulerBusy=false;	
var pkg;
var probSet;
var probName;
var contextMessage;
var problemSummary;
var allMessages;			//Every message that is in the replay unit
var student = 0;			//The number of which student file is being worked on
	
/** Used to delay the firing of SAI's */
var d = new Date();
var startTime = d.getTime();
	
	
$(document).on("ready",function(){
	getReplayUnitMessages();
	initScheduler();
	
	$("body").append("<table style=\"margin-top:10px;margin-left:10px;width:60%;"+
				"border:3px solid red;boder-collapse:collapse\" id=\"tablePete\"></table>");
	$("#tablePete").hide();
});


/**
	Call commShell.gradeSAI with a message from schedule()
*/
function fireSAI (aMessage)
{
	console.log(aMessage);
	$("#tablePete").show();
	$("#tablePete").append('<tr><td>'+aMessage.selection +'</td><td>'+
			"\t"+aMessage.action+"</td><td>"+aMessage.input+"</td></tr></br></div>");
	
	//commShell.gradeSAI (aMessage.selection,aMessage.action,aMessage.input);
	console.log('would send this message to commshell now, but cant yet');
}

	
/**
	Contains simple mutex to ensure that fireSAI is called only once at a time.
	Determines when to fire an SAI based on the message attributes
*/
function schedule ()
{
	if (schedulerBusy==true)
	{
		return;
	}
	
	if( messageIndex >= messages.length ){
		//SEND PROBLEM SUMMARY
		
		/*var data = getContextData();
		console.log(data);
		
		var xmlhttp = new XMLHttpRequest();
		var url = "process_replay_student_assignment/"+data['pkg']+ "/" +
				data["ps"]+ "/" +data["prob"]+ "?username="+parent.student;
		
		xmlhttp.open("POST", url, false);
		xmlhttp.send();*/
		
		parent.finishedWithProblem();
	}
	
	schedulerBusy=true;
	
	if( messageIndex < messages.length ){
		var currentMessage = messages[messageIndex];
	}
	else{
		return;
	}
	
	d = new Date();
	var currTime = d.getTime();
	if (currentMessage.delay/3 < (currTime - startTime) && messageIndex < messages.length)
	{
		fireSAI (messages [messageIndex]);
		messageIndex++;
	}
	
	schedulerBusy=false;
}
	
/**
	Check to see if there is a message that needs to be fired every second.
*/
function initScheduler ()
{
	setInterval (function(){schedule();},500);
}

	
	/**
		Determine which message file is not being actively used, the return the number of it.
	*/
	function getStudentNumber()
	{
		var xhttp = new XMLHttpRequest();
		var numStd = 15;
		var newStudent = 0;
		
		//determine the number of students by reading the file that has that number
		xhttp.onreadystatechange = function() 
		{
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				window.localStorage.setItem("numStudents", xhttp.responseText);
				numStd = parseInt(xhttp.responseText);
			}
		};
		
		if( window.localStorage.getItem("activeStudents") != null ){
			var s = window.localStorage.getItem("activeStudents").split(",");
			var activeAr = [];
			
			for( var i = 0; i < s.length; i++ ){
				activeAr[activeAr.length] = parseInt(s[i]);
			}
			
			for( var i = 0; i < numStd; i++ ){
				if (activeAr[i] != i){
					activeAr[activeAr.length] = i;
					newStudent = i;
					activeAr.sort();
					break;
				}
			}
			
			var newActive = "";
			for( var i = 0; i < activeAr.length; i++ ){
				newActive = newActive + ''+activeAr[i];
				if( i != activeAr.length-1 ){
					newActive = newActive + ",";
				}
			}
			
			window.localStorage.setItem("activeStudents" , newActive);
		}
		else{
			window.localStorage.setItem("activeStudents",  "0");
			newStudent = 0;
		}
		
		student = newStudent;
		return newStudent;
	
		xhttp.open("GET", "/messages/studentNum.txt", false);
		//xhttp.send();
		return newStudent;			
	}
	
	/**
		Sort the messages in this array by when they were performed using the actual
		time that they were executed (milliseconds since 1970).  Then calculate the
		delay by subtracting the time of each message by the time of the first message.
	*/
function sortMessages(messages)
{
	var val; var i; var j;
	
	for( i = 0; i < messages.length; i++ ){
		val = messages[i];
		for( j = i - 1; j >= 0 && messages[j].delay > val.delay; j-- ){
			messages[j+1] = messages[j];
		}
		messages[j+1] = val;
	}
	
	var begin = messages[0].delay-5000;
	for( var i = 0; i < messages.length; i++ ){
		messages[i].delay = messages[i].delay - begin;
	}
	
	return messages
}
	

/**
	Get package, problem set, and problem name from parent (master)
*/
function getContextData()
{
	return parent.getDataForInterface(contextMessage);
}


/**
	Get the script of the messages (including context and problem summaries)
	from the parent JS file (master).  Save all the messages as classes in 
	messages.  Then save the context message and problem summary.
*/
function getReplayUnitMessages()
{
	console.log("in getReplayUnitMessages()");
	//console.log(typeof(parent.getNextScript));
	if( typeof(parent.getNextScript) != 'function' ){
		console.log("get next script not executed")
		return false;
	}
	
	allMessages = parent.getNextScript();
	console.log('allmessages='+allMessages);
	var startTime = -1;
	
	for( var i = 1; i < allMessages.length - 1; i++ )
	{
		var tokens = allMessages[i].split("<");
		var sel; var act; var inp; var timeSinceStart; var filename;
		for ( var j = 0; j < tokens.length; j++ )
		{
			if( tokens[j] == "Selection>"){
				sel = tokens[j+1].split(">")[1];
			}
			if( tokens[j] == "Action>"){
				act = tokens[j+1].split(">")[1];
			}
			if( tokens[j] == "Input>"){
				inp = tokens[j+1].split(">")[1];
			}
			if( tokens[j].length > 6 ){
				if( tokens[j].substring(0,5)== "Time>" ){
					time = tokens[j].split(">")[1];
					var t = new Date(time.substring(0,time.length-4)).getTime();
					if(startTime == -1){
						startTime = t;
						//timeSinceStart = 0;
						timeSinceStart = t;
					}
					else{
						//timeSinceStart = t - startTime;
						timeSinceStart = t;
					}
				}
			}
			if( tokens[j].length > 14 ){
				if( tokens[j].substring(0,14) == "question_file>" ){
					filename = tokens[j].split(">")[1];
				}
			}
		}
		messages[messages.length] = {selection:sel, action:act, input:inp,
						delay:timeSinceStart, file:filename};
		
		problemSummary = allMessages[allMessages.length - 1];
		contextMessage = allMessages[0];
	}
	
	messages = sortMessages(messages);
	for( var m = 0; m < messages.length; m++ ){
		console.log(messages[m]);
	}
	
	console.log("exiting getReplayUnitMessages");
}

/** Helper functions */
function isSAI(s)
{
	if(s.length < 9){
		return false;
	}
	if(s.substring(0,9) == '<message>')
	{
		return true;
	}
	return false;
}
function isProblemSummary(s)
{
	if( s.length < 15){
		return false;
	}
	if( s.substring(0,15) == '<ProblemSummary' ){
		return true;
	}
	return false;
}
function isContextMessages(s)
{
	if( s.length < 16){
		return false;
	}
	if( s.substring(0,16) == '<context_message' ){
		return true;
	}
	return false;
}


/*var studentScript;
	var map;
	var mapHeader;
	
	function getStudentScript()
	{
		var stdNum = 0; 					//ToDo: make this get different students
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				studentScript = xhttp.responseText;
			}
		};
		xhttp.open("GET", "/messages/student_"+stdNum+".xml", true);
		xhttp.send();
	}
	
	function getMap()
	{
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (xhttp.readyState == 4 && xhttp.status == 200) {
				var lines = xhttp.responseText.split('\n');
				mapHeader = lines[0].split('\t');
				
				//map = [][];
				for( var i = 1; i < lines.length; i++ )
				{
					var tokens = lines[i].split('\t');
					map[i-1] = tokens;
				}
			}
		};
		xhttp.open("GET","map.txt",true);			//ToDo: change the map name
		xhttp.send();
	}*/
	/**
		Before the page is closed or refreshed, take this student off of the list of
		active student message scripts.
	*/
	/*$(window).on('beforeunload',function(){
		var s = window.localStorage.getItem("activeStudents").split(",");
		var newActive = "";
		for( var i = 0; i < s.length; i++ ){
			if (parseInt(s[i]) == student){
				continue;
			}	
			newActive = newActive + s[i];
			if( i != s.length-1 ){
				newActive = newActive + ",";
			}
		}	
		window.localStorage.setItem("activeStudents",newActive);
	});*/