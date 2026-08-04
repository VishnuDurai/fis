<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
	header("location:access-denied.php");
}
?>
<?php
$result1 = mysql_query("select * from professional");
while($row1=mysqli_fetch_array($result1)){
  $options = $options."<option>$row1[1]</option>";
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

	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Professional Details</marquee></b></div>
<form action=" " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>
<div class="form-control"><br>
			<center><h3 style="color: #682D87;" class="form-group">Fill Your Professional  Details</h3></center><hr>
		<table align="center">

<tr><td>Staff ID</td>
<td><input type="number" class="form-control" name="staff_id"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_id = $_GET['staff_id'];
    echo $staff_id;
  }?>"
  style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Staff Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><input type="text" class="form-control" name="staff_name"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_name = $_GET['staff_name'];
    echo $staff_name;
  }
  ?>"
   style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Membershipid</td>
  <td><input type="text" class="form-control" name="membershipid" class="form-control"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $membershipid = $_GET['membershipid'];
      echo $membershipid;
    }
    ?>"
    style='background-color:white; font-weight:bold; text-transform:uppercase;' >
		</td></tr>
<tr><td>Organization</td>
  <td><input type="text" class="form-control" name="organization"
     value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $organization = $_GET['organization'];
      echo $organization;
    }
    ?>"
    style='background-color:white; font-weight:bold;text-transform:uppercase;' ></td></tr>
<tr><td>&nbsp;</td><td><br>
  <input type="submit" class="btn btn-outline-success" onclick="window.location.reload(true)" style="cursor: pointer;" name="submit" value="Update"></td><td><br><center>
	<a href="professional.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $type = $_POST['membershipid'];
    $title = $_POST['organization'];
    $sql = mysql_query("update staff_member set membershipid='$type',organization='$title' where id='$id'");
if($sql){?>
	<script>
  alert('successfully uploaded');
        window.location.href='professional.php?success';
        </script>
<?php
}
else
{
?>
<script>
alert('Please uploading file');
      window.location.href='professional.php?fail';
      </script>
	<?php
}
}
}
?>
