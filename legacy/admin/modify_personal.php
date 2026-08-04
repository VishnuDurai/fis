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
	<title>Personal</title>
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

	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Personal Details</marquee></b></div>
<form action=" " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>
<div class="form-control"><br>
			<center><h3 style="color: #682D87;" class="form-group">Fill Your Personal Details</h3></center><hr>
		<table align="center">

<tr><td>Staff ID</td>
<td><input type="number" class="form-control" name="staff_id"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_id = $_GET['staff_id'];
    echo $staff_id;
  }?>"
  style='background-color:white; font-weight:bold;' ></td></tr>
<tr><td>Staff Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><input type="text" class="form-control" name="staff_name"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_name = $_GET['staff_name'];
    echo $staff_name;
  }
  ?>"
   style='background-color:white; font-weight:bold;' ></td></tr>
<tr><td>Date of Birth</td>
  <td><input type="text" class="form-control" name="dob" class="form-control"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $dob = $_GET['dob'];
      echo $dob;
    }
    ?>"
    style='background-color:white; font-weight:bold;' required>
		</td></tr>
<tr><td>Gender</td>
  <td><input type="text" class="form-control" name="gender"
     value="<?php
     if(isset($_GET['id'])){
       $id = $_GET['id'];
       $title = $_GET['gender'];
       echo $title;
     }
     ?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Address</td>
<td><input type="text" class="form-control" name="address"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $from = $_GET['address'];
    echo $from;
  }
  ?>"
  style='background-color:white; font-weight:bold;' required></td></tr>
<td>Mobile</td>
<td><input type="number" class="form-control" name="mobile"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $to = $_GET['mobile'];
    echo $to;
  }
  ?>"
   style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Email</td>
<td><input type="email" class="form-control" name="email"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $email = $_GET['email'];
    echo $email;
  }
  ?>"
  style='background-color:white; font-weight:bold;' required></td></tr>
	<tr><td>Pan</td>
	<td><input type="text" class="form-control" name="pan"
	  value="<?php
	  if(isset($_GET['id'])){
	    $id = $_GET['id'];
	    $pan = $_GET['pan'];
	    echo $pan;
	  }
	  ?>"
	  style='background-color:white; font-weight:bold;' required></td></tr>
      	<tr><td>Aadhar</td>
	<td><input type="text" class="form-control" name="aadhar"
	  value="<?php
	  if(isset($_GET['id'])){
	    $id = $_GET['id'];
	    $aadhar = $_GET['aadhar'];
	    echo $aadhar;
	  }
	  ?>"
	  style='background-color:white; font-weight:bold;' required></td></tr>
            	<tr><td>Type</td>
	<td><input type="text" class="form-control" name="type"
	  value="<?php
	  if(isset($_GET['id'])){
	    $id = $_GET['id'];
	    $type = $_GET['type'];
	    echo $type;
	  }
	  ?>"
	  style='background-color:white; font-weight:bold;' required></td></tr>
		<!--<tr><td><input class="btn btn-outline-primary" style="cursor: pointer; width: 300px;" type='file' name='file'></td>
			<td><input class="btn btn-outline-info" style="cursor: pointer;" type='submit' name='sub_file'></td>
		</tr>-->
<tr><td>&nbsp;</td><td><br>
  <input type="submit" class="btn btn-outline-success" onclick="window.location.reload(true)" style="cursor: pointer;" name="submit" value="Update"></td><td><br><center>
	<a href="personal.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
if(isset($_GET['id'])){
  if(isset($_POST['submit'])){
    $id = $_GET['id'];
    $staff_id = $_POST['staff_id'];
    $staff_name = $_POST['staff_name'];
    $dob = $_POST['dob'];
    $title = $_POST['gender'];
    $from = $_POST['address'];
    $to = $_POST['mobile'];
    $org = $_POST['email'];
    $pan = $_POST['pan'];
    $aadhar = $_POST['aadhar'];
    $type = $_POST['type'];
    $sql = mysql_query("update staff_personal set staff_id='$staff_id',staff_name='$staff_name',dob='$dob',gender='$title',address='$from',
    mobile='$to',email='$org',pan='$pan',aadhar='$aadhar',type='$type' where id='$id'");
if($sql){?>
	<script>
  alert('successfully uploaded');
        window.location.href='personal.php?success';
        </script>
<?php
}
else
{
?>
<script>
alert('error while uploading file');
      window.location.href='personal.php?fail';
      </script>
	<?php
}
}
}
?>
