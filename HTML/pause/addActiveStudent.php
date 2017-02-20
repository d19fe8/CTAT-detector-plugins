<?php
	$f = fopen("activeStudents.txt","a+");
	$std = "hey".$_GET["student"];
	fwrite($f, $std);
	fclose($f);
?>