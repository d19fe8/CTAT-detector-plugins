/*
	For testing the dashboard.
	Has functions for the outer part of the test page.
	-Peter
*/
var studentScript;
var map;
var mapHeader;
var scriptIndex;
var myFrame;
var inChangeProblem = false;
var student = 1;
var saiTableContents= '';

$(document).on("ready",function(){
	getStudentScript();
	getMap();
	$("#student_info").html("Student: "+student);
	
	saiTableContents = "<html><table style=\"margin-top:10px;margin-left:10px;width:95%;"+
			"border:3px solid lightgreen;background-color: white;\" id=\"saiTableHolder\"></table></html>";
	document.getElementById("saiTable").srcdoc = saiTableContents;
	$("#saiTable").hide();
	
	makeCenter();
	
	beginLoadTester();
});

function beginLoadTester()
{
	myFrame = document.createElement("IFRAME");
	changeProblem();
}

/**
	Called by the tutor UI upon being unloaded. 
		Sends problem summary, and then calls changeProblem()
*/
function endProblem(problemSummary){
	var url = "/process_replay_student_assignment/0/0";			//ToDo: change parameters
	
	$.post(url, problemSummary, function(result){console.log('result='+result);});
	
	changeProblem();
}

function changeProblem()
{
	if( inChangeProblem == true ){
		return;
	}
	
	$('#saiTableHolder').text('');
	$('#saiTableHolder').hide();
	$("#saiTable").contents().find('table').html("");
	$("#saiTable").hide();
	
	inChangeProblem = true;
	
	interfaceData = getDataForInterface( studentScript[scriptIndex] );

	var pkg = interfaceData['pkg'];
	var ps = interfaceData['ps'];
	var prob = interfaceData['prob'].replace(" ","+");

	$("#problem_info").html("Problem Name: "+prob+"</br>Problem Set: "+ps+"</br>Package: "+pkg);
	
	$("#tutorFrame").html('');
	myFrame = document.createElement("IFRAME");
	myFrame.setAttribute("id","tutor");
	$("#tutorFrame").append(myFrame);
	$("#tutor").css("width",$("#tutorFrame").css("width"));
	$("#tutor").css("height",$("#tutorFrame").css("height"));

			
	var forFrame = "https://dashboard.fractions.cs.cmu.edu/run_replay_student_assignment/"+
				pkg+"/"+ps+"/"+prob+"/0/fakestudent1/";
				
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			forFrame = xhttp.responseText.split('\n');
		}
	};
	xhttp.open("POST", forFrame, false);
	xhttp.send();
	
	if( (forFrame+"").substring(0,5) == "<!DOC" ){
		myFrame.setAttribute("srcdoc",forFrame);
	}
	else{
		myFrame.setAttribute("src",forFrame);
	}
		
	inChangeProblem = false;
}


/**
	Called by the tutor to get data for the interface including:
		package, problem set, and problem name
*/
function getDataForInterface( ctxMess )
{
	//get the context message for the current problem
	
	var probName = ctxMess.split('<problem><name>')[1].split('</name>')[0];
	
	var mapData = map[probName];
	var pkg = mapData[mapHeader.indexOf('Package')];
	var ps = mapData[mapHeader.indexOf('Level (ProblemSet)')];
	
	var ret = {};
	ret['pkg'] = pkg;
	ret['ps'] = ps;
	ret['prob'] = probName;
	
	return ret;
}

/**
	Called by LoadTester.js to get a single script that contains all the messages
	in one replay unit.
*/
function getNextScript()
{
	console.log('scriptIndex = '+scriptIndex);
	var replayUnitScript = []
	for( var i = 0; scriptIndex < studentScript.length; scriptIndex++ )
	{
		var line = studentScript[scriptIndex]

		if(line.length < 15){ break; }

		if(line.substring(0,15) == "<ProblemSummary"){
			replayUnitScript[i++] = line;
			scriptIndex++;
			break;
		}
		replayUnitScript[i] = line;
		i++;
	}

	return replayUnitScript;
}

/**
	Make a request to the server to get the student's script.  Splits it 
	on newlines and saves it as studentScript.
*/
function getStudentScript()
{
	scriptIndex = 2;
	currentURL = window.location.href;
	console.log('currurl'+currentURL);
	student = parseInt(currentURL.split('?')[1]);
	student = 172;
	console.log('whichstudent'+student);
	var stdNum = student; 					//ToDo: make this get different students
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			studentScript = xhttp.responseText.split('\n');
		}
	};
	xhttp.open("GET", "messages/student_"+stdNum+".xml", false);
	xhttp.send();
	
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
		}
	};
	xhttp.open("GET", "/replay/pause/addActiveStudent.php?student="+student, false);
	xhttp.send();
}

/**
	Make a request to the server for the map linking problem name/problem set/assignment/
	brd/swf/package
	Save as a hashmap of problem name to the other info.
*/
function getMap()
{
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var lines = xhttp.responseText.split('\n');
			mapHeader = lines[0].split('\t');
			
			map = {};
			for( var i = 1; i < lines.length; i++ )
			{
				var tokens = lines[i].split('\t');
				
				map[tokens[0]] = tokens;
			}
		}
	};
	xhttp.open("GET","map.txt",false);			//ToDo: change the map name
	xhttp.send();
}

/**
	Called by LoadTester.js when a new SAI is being fired.  This will
	display the SAI in a table at the bottom of the screen.
*/
function addSAItoTable(s, a, i)
{
	$("#saiTable").show();
	/*$("#saiTableHolder").prepend('<tr><td>'+s +'</td><td>'+
			"\t"+a+"</td><td>"+i+"</td></tr></br>");*/
	var newEntry = '<tr><td>'+s +'</td><td>'+
			"\t"+a+"</td><td>"+i+"</td></tr></br>";
	var newline = '<div id="deletethis"></br></div>';
	$("#saiTable").contents().find('table').prepend(newline);
	
	setTimeout(function(){
		$("#saiTable").contents().find('#deletethis').remove();
		$("#saiTable").contents().find('table').prepend(newEntry);
	},100);
}

$(window).on("resize", function (){
	makeCenter();
});

function makeCenter()
{
	var width = window.innerWidth;
	var height = window.innerHeight;
	var currSize = parseInt($("#tutorFrame").css("width"));
	var marginLeft = (width-currSize)/2;
	if (marginLeft < 0){marginLeft = 0;}
	$("#tutorFrame").css("margin-left",marginLeft);
	
	currSize = parseInt($("#replayInfo").css("width"));
	marginLeft = (width-currSize)/2;
	if (marginLeft < 0){marginLeft = 0;}
	$("#replayInfo").css("margin-left",marginLeft);
	
	currSize = parseInt($("#saiTable").css("width"));
	marginLeft = (width-currSize)/2;
	if (marginLeft < 0){marginLeft = 0;}
	$("#saiTable").css("margin-left",marginLeft);
	
	currSize = parseInt($("#saiTableHolder").css("width"));
	if (currSize > 0){
		marginLeft = (width-currSize)/2;
		if (marginLeft < 0){marginLeft = 0;}
		$("#saiTableHolder").css("margin-left",marginLeft);
	}
}

function isPaused()
{
	/*$.ajax({
		type:'POST',
		url:"/replay/pause/check.php",
		async:false,
		success: function (data){
			console.log("$"+data+"$");
			if( data == "paused" ){
				console.log('returning true');
				var pa = 'pause';
				return true;
			}
			else{
				var pl = 'play';
				return false;
			}
		}
	});*/
	
	var ret;
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var data = xhttp.responseText;
			console.log("$"+data+"$");
			if( data == "paused" ){
				console.log('returning true');
				var pa = 'pause';
				ret = true;
			}
			else{
				var pl = 'play';
				ret = false;
			}
		}
	};
	xhttp.open("GET", "/replay/pause/control.txt", false);
	xhttp.send();
	/*for( var i = 0; i < 999999999; i++){
		for( var j = 0; j < 99999999; j++){
			var x = 999.999*2.5352*8.224;
		}
	}*/
	return ret;
}

$(window).on("beforeunload", function(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			console.log(xhttp.responseText);
		}
	};
	xhttp.open("GET", "/replay/pause/removeActiveStudent.php?student="+student, false);
	xhttp.send();
});