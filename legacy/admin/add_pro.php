<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
	header("location:access-denied.php");
}
$result = mysql_query("SELECT * FROM staff_user WHERE staff_id = '$_SESSION[staff_id]'")
or die("there is no records to display..\n" . mysql_error());

if(mysql_num_rows($result)<1)
{
  $result = null;
}

$row = mysql_fetch_array($result);

if($row)
{
  $id = $row['staff_id'];
  $name = $row['firstname'];
 }
?>
<!DOCTYPE html>
<html>
<head>
	<title></title>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<style>
body{
background:url(images/2.jpg);
background-repeat:no-repeat;
background-size:100% 100%;
height:800px;
background-attachment:fixed;
}
</style>
</head>
<body bgcolor="tan"><br>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id="page">
	<div id="header">
	</div>
	<div class="container">
	<center><?php include('navbar.php');?></center><hr>
	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">ADD NEW ORGANIZATION</marquee></b></div>
	<form action="add_pro.php" method="post"><hr>
    <div class="form-control"><br>
	<center><h3 style="color: #682D87;">New Organization</h3></center><hr>
	<table align="center">
<tr><td>Add new organization:</td>
<td><input type="text" class="form-control" name="pro_name" style='background-color:white; font-weight:bold;' required></td></tr>
<td><br><input type="submit" name="add_club" style="cursor: pointer"; class="btn btn-outline-info offset-10" value="Add"></td>
</table><br>
</div>
</form>
<hr>
</div>
</div>
</body>
</html>
<?php
require('DB/dbcon.php');
if(isset($_POST['add_club'])){
  $id = $_POST['id'];
  $club = $_POST['pro_name'];
  $sql = mysql_query("insert into professional (id,pro_name) values ('$id','$club')");
	if($sql){
		header("location:add_pro.php");
		echo "<script type='text/javascript'>alert('Organisation Added successfully !')</script>";
	}
}
?>
