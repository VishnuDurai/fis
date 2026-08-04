<?php
session_start();
require ('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Report Information</title>
	 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
</head>
<body bgcolor="tan"><br>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id="page">
<div id="header">
</div>
<div class="container">
	<center><?php include('navbar.php');?></center><hr>
  <div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Select a report Details</marquee></b></div><hr>
     <center><h3 style="color: #682D87;">Report</h3></center>
      <hr>
     <div class="form-control">

<center>

  <div class="form-inline">
    <ul class="nav nav-tabs">
      <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">GENERAL</a>
    <div class="dropdown-menu">
      <a class="dropdown-item" href="#">Personal</a>
      <a class="dropdown-item" href="#">Academics</a>
      <a class="dropdown-item" href="#">Professional</a>
      
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="#">All information</a>
    </div>
  </li>
    </ul>
    <ul class="nav nav-tabs">
      <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Select a details</a>
    <div class="dropdown-menu">
      <a class="dropdown-item" href="interactiontable.php">Staff Interaction</a>
      <a class="dropdown-item" href="resourcetable.php">Resource Person</a>
      <a class="dropdown-item" href="#">Research and Development</a>
      <a class="dropdown-item" href="#">Event Organized</a>
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="#">All information</a>
    </div>
  </li>
    </ul>
      </div>
    </div></center>

 </div>
 <hr>
 </div>
</div>
</body>
</html>
