<?php
	$f = fopen("activeStudents.txt","r");
	$line = fgets($f);
	$tokens = explode("hey",$line);
	$std = $_GET["student"];
	echo $std . "isstudent   ";
	$newLine = "";
	for ( $i = 0; $i < sizeof($tokens); $i++ ){
		if( $tokens[$i] == "" ){
			continue;
		}
		if( $std != $tokens[$i]){
			$newLine = $newLine . "hey" . $tokens[$i];
		}
	}
	echo $newLine."isnewline   ";
	fclose($f);
	$f = fopen("activeStudents.txt","w");
	fwrite($f, $newLine);
	fclose($f);
?>