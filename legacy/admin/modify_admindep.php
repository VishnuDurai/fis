<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
	header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Research Scholars</title>
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

	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Manage Department Admin User</marquee></b></div>
<form action=" " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>
<div class="form-control"><br>
			<center><h3 style="color: #682D87;" class="form-group">Manage Department Admin User </h3></center><hr>
		<table align="center">
<tr><td>Department</td>
  <td><input type="text" class="form-control" name="Department"
     value="<?php
     if(isset($_GET['staff_id'])){
       $id = $_GET['staff_id'];
       $title = $_GET['Department'];
       echo $title;
     }
     ?>"
    style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>User Id</td>
<td><input type="text" class="form-control" name="staff_id"
  value="<?php
  if(isset($_GET['staff_id'])){
    $id = $_GET['staff_id'];
    $from = $_GET['staff_id'];
    echo $from;
  }
  ?>"
  style='background-color:white; font-weight:bold;' readonly></td></tr>
<td>Password</td>
<td><input type="text" class="form-control" name="password"
  value="<?php
  if(isset($_GET['staff_id'])){
    $id = $_GET['staff_id'];
    $to = $_GET['password'];
    echo $to;
  }
  ?>"
   style='background-color:white; font-weight:bold;' ></td></tr>
<tr><td>&nbsp;</td><td><br>
  <input type="submit" class="btn btn-outline-success" onclick="window.location.reload(true)" style="cursor: pointer;" name="submit" value="Update"></td><td><br><center>
	<a href="admindep_user.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
if(isset($_GET['staff_id'])){
  if(isset($_POST['submit'])){
    $id = $_GET['staff_id'];
    $type = $_POST['password'];
    $sql = mysql_query("update admin_dep set password='$type' where staff_id='$id'");
if($sql){?>
	<script>
  alert('Successfully Updated');
        window.location.href='admindep_user.php?success';
        </script>
<?php
}
else
{

?>
<script>
alert('Error Updating');
      window.location.href='admindep_user.php?fail';
      </script>
	<?php
}
}
}
?>
