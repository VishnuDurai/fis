<?php

require ('DB/dbcon.php');

if(isset($_GET['dow']))
{
  $path = $_GET['dow'];

  $res = mysql_query("select * from staff_edu where path='$path'");

  header('Content-Type: application/octet-stream');
  header('Content-Disposition: attachment; filename="'.basename($path).'"');
  header('Content-Length:'.filesize($path));
  readfile($path);
}

 ?>