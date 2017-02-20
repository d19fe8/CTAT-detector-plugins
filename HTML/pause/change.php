<?php
	$f = fopen("control.txt","r");
	$pauseplay = fread($f, filesize("control.txt"));
	fclose($f);
	
	
	$w = fopen("control.txt","w");
	if( $pauseplay == "paused" ){
		echo "it's pause";
		fwrite($w, "playing");
	}
	else{
		echo 'its play';
		fwrite($w, "paused");
	}
	fclose($w);
?>