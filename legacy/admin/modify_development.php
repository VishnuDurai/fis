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
	<title>Research Development</title>
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

	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Research and Development</marquee></b></div>
	<form action=" " onsubmit="return registerValidate(this)" method="post"><hr>

			<div class="form-control"><br>
				<center><h3 style="color: #682D87;">Please Fill your Research Development Details</h3></center><hr>
			<table align="center">
<tr><td>Type</td>
  <td><input type="text" class="form-control" name="type"
     style='background-color:white; font-weight:bold;'
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $type = $_GET['type'];
      echo $type;
    }?>" required></td></tr>
<tr><td>Principle investigator/ Faculty Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><input type="text" class="form-control" name="staff_name"
   style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_name = $_GET['staff_name'];
    echo $staff_name;
  }?>" required></td>
<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Co-invesgator/ Faculty Name&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><input type="text" class="form-control"
  name="coname" style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $coname = $_GET['coname'];
    echo $coname;
  }?>"
   ></td></tr>
<tr><td>Principle Investigator/ Faculty ID</td>
<td><input type="number" class="form-control"
  name="staff_id"  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_id = $_GET['staff_id'];
    echo $staff_id;
  }?>" readonly></td>
<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Co-investigator/ Faculty ID&nbsp;&nbsp;&nbsp;&nbsp;</td>
<td><input type="number" class="form-control" name="coid"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $coid = $_GET['coid'];
    echo $coid;
  }?>"
   ></td></tr>
<tr><td>Title of the project</td><td><input type="text" class="form-control" name="title"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $title = $_GET['title'];
    echo $title;
  }?>"
    required></td></tr>
<tr><td>From Date</td>
<td><input type="date" class="form-control col-lg-10" name="from_date"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $from_date = $_GET['from_date'];
    echo $from_date;
  }?>"
   required></td>
<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To Date</td>
<td><input type="date" class="form-control col-lg-10" name="to_date"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $to_date = $_GET['to_date'];
    echo $to_date;
  }?>"
   required></td></tr>
<tr><td>Academics Year</td><td><input type="number" class="form-control" name="year_aca"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $year_aca = $_GET['year_aca'];
    echo $year_aca;
  }?>"
    required></td></tr>
<tr><td>Status</td><td><input type="text" class="form-control" name="status"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $status = $_GET['status'];
    echo $status;
  }?>"
   required></td></tr>
<tr><td>Name of the institution</td><td><input type="text" class="form-control" name="institution"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $institution = $_GET['institution'];
    echo $institution;
  }?>"
   required></td></tr>
<tr><td>Revenue Generated</td><td><input type="number" class="form-control" name="revenue"
  style='background-color:white; font-weight:bold;'
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $revenue = $_GET['revenue'];
    echo $revenue;
  }?>"
    required></td></tr>
<tr><td>&nbsp;</td><td><br><input type="submit" class="btn btn-outline-success" onclick="window.location.reload(true)" style="cursor: pointer;" name="submit" value="Update"></td><td>&nbsp;</td><td><br>
	<center><a href="development_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $type = $_POST['type'];
    $coname = $_POST['coname'];
    $coid = $_POST['coid'];
    $title = $_POST['title'];
    $from_date = $_POST['from_date'];
    $to_date = $_POST['to_date'];
    $year_aca = $_POST['year_aca'];
    $status = $_POST['status'];
    $institution = $_POST['institution'];
    $revenue = $_POST['revenue'];
  $sql = mysql_query("update staff_development set type='$type',coname='$coname',coid='$coid',title='$title',
  from_date='$from_date',to_date='$to_date',year_aca='$year_aca',status='$status',institution='$institution',
  revenue='$revenue' where id='$id'");
  if($sql){
    ?>
		<script>
	  alert('successfully uploaded');
	        window.location.href='development_test.php?success';
	        </script>
		<?php
	}
	else
	{
		?>
		<script>
		alert('error while uploading file');
		      window.location.href='development_test.php?fail';
		      </script>
		<?php
  }
 }
}

?>
