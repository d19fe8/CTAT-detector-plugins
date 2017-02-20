/*
	For testing the dashboard.
	-Peter
*/

var SPEED_FACTOR=1;			//how many times faster than the actual student action

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
	
	
$(document).on("ready",function()
{
	getReplayUnitMessages();
	
	initScheduler();
	
});


/**
	Call commShell.gradeSAI with a message from schedule()
*/
function fireSAI (aMessage)
{
	console.log(aMessage);
	
	commShell.gradeSAI (aMessage.selection,aMessage.action,aMessage.input);

	parent.parent.addSAItoTable(aMessage.selection,aMessage.action,aMessage.input);
}

	
/**
	Contains simple mutex to ensure that fireSAI is called only once at a time.
	Determines when to fire an SAI based on the message attributes
*/
var startPauseTime = -1;
var totalPauseTime = 0;
function schedule ()
{
	if (schedulerBusy==true)
	{
		return;
	}
	
	var paused = parent.parent.isPaused();
	if( paused ){
		if (startPauseTime < 0){
			d = new Date();
			startPauseTime = d.getTime();
		}
		return;
	}
	else{
		if (startPauseTime > 0){
			d = new Date();
			totalPauseTime += d.getTime() - startPauseTime;
		}
		startPauseTime = -1;
	}
	
	/*
	Never actually gets to this line.  Once the student hits the done button, the 
	interface unloads.  So change problem is called on the window.unload below.
	if( messageIndex >= messages.length ){
		parent.parent.changeProblem();
	}*/
	
	schedulerBusy=true;
	
	if( messageIndex < messages.length ){
		var currentMessage = messages[messageIndex];
	}
	else{
		return;
	}
	
	d = new Date();
	var currTime = d.getTime() - totalPauseTime;  //account for time while paused.
	if (currentMessage.delay/SPEED_FACTOR < (currTime - startTime) && messageIndex < messages.length)
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
	setInterval (function(){schedule();},1000);
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
	return parent.parent.getDataForInterface(contextMessage);
}


/**
	Get the script of the messages (including context and problem summaries)
	from the parent JS file (master).  Save all the messages as classes in 
	messages.  Then save the context message and problem summary.
*/
function getReplayUnitMessages()
{
	if( typeof(parent.parent.getNextScript) != 'function' ){
		return false;
	}
	
	allMessages = parent.parent.getNextScript();

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
						timeSinceStart = t;
					}
					else{
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
	//Sort the messages and change the delay to how long after the first sai
	//they were executed.
	messages = sortMessages(messages);
}

/**
	When the tutor is finished, call up to the parent to change the problem.
*/
$(window).on('unload',function()
{
	//parent.parent.endProblem(problemSummary);	I don't think you need to do this
	parent.parent.changeProblem1();	///CHANGE
});