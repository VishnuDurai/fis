<?php
header('Content-Type: application/vnd.ms-excel');
header('Content-disposition: attachment; filename='report'.xls');
echo $_GET["data"];
 ?>
