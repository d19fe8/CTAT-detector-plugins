<?php
$f = fopen("control.txt","r");
$pauseplay = fread($f, filesize("control.txt"));
echo $pauseplay;
fclose($f);
?>