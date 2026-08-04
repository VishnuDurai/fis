<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
	header("location:access-denied.php");
}
$result = mysql_query("SELECT * FROM staff_academics WHERE staff_id = '$_SESSION[staff_id]'")
or die("there is no records to display..\n" . mysql_error());
if(mysql_num_rows($result)<1)
{
  $result = null;
}

$row = mysql_fetch_array($result);

if($row)
{
  $id = $row['staff_id'];
  $name = $row['staff_name'];
  $date = $row['Date_of_joining'];
  $dep = $row['Department'];
  $des = $row['Designation'];
  $qua = $row['Qualification'];
  $area = $row['area_of_special'];
  $title = $row['title_of_thesis'];
 }
?>
<!DOCTYPE html>
<html>
<head>
	<title>Modilfy Academics</title>
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

	<div style="color: #682D87; font-size:20" class="news"><b><marquee behavior="alternate">Academics Details</marquee></b></div>

<form action=" " method="post" enctype="multipart/form-data"><hr>
<div class="form-control"><br>
<center><h3 style="color: #682D87;">Academic Details</h3></center><hr>
		<table align="center"><br>
<tr><td>Staff ID</td>
<td><input type="number" class="form-control" name="staff_id"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_id = $_GET['staff_id'];
      echo $staff_id;
    }?>"
  style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>Staff Name</td>
  <td><input type="text" class="form-control" name="staff_name"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $staff_name = $_GET['staff_name'];
        echo $staff_name;
      }?>"
    style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>Date Of Joining</td>
  <td><input type="date" class="form-control" name="Date_of_joining"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $dob = $_GET['Date_of_joining'];
        echo $dob;
      }?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Department</td>
  <td><input type="text" class="form-control" name="Department"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $Department = $_GET['Department'];
        echo $Department;
      }?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Designation</td>
  <td><input type="text" class="form-control" name="Designation"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $Designation = $_GET['Designation'];
        echo $Designation;
      }?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Qualification</td>
  <td><input type="text" class="form-control" name="Qualification"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $Qualification = $_GET['Qualification'];
        echo $Qualification;
      }?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Area Of Specialization&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
  <td><input type="text" class="form-control" name="area_of_special"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $area_of_special = $_GET['area_of_special'];
      echo $area_of_special;
    }?>"
     style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>Title Of Thesis</td>
  <td><input type="text" class="form-control" name="title_of_thesis"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $title_of_thesis = $_GET['title_of_thesis'];
      echo $title_of_thesis;
    }?>"
      style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>Appointment Order</td>
	<td><input class="btn btn-outline-primary" style="cursor: pointer; width: 200px;" type='file' name='file1'></td>
	<td><input type="submit" class="btn btn-outline-info" style="cursor: pointer;" value="update" name="upd_file1"></td>
</tr>
<tr><td>Joining Letter</td>
	<td><input class="btn btn-outline-primary" style="cursor: pointer; width: 200px;" type='file' name='file2'></td>
	<td><input type="submit" class="btn btn-outline-info" style="cursor: pointer;" value="update" name="upd_file2"></td>

</tr>
<tr><td>CA/Promotion Order</td>
	<td><input class="btn btn-outline-primary" style="cursor: pointer; width: 200px;" type='file' name='file3'></td>
	<td><input type="submit" class="btn btn-outline-info" style="cursor: pointer;" value="update" name="upd_file3"></td>
</tr>
<tr><td>&nbsp;</td><td><br>
<input type="submit" class="btn btn-outline-success" onclick="window.location.reload(true)" style="cursor: pointer;" name="submit" value="Update"></td><td><br><center>
<a href="academics.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $staff_name = $_POST['staff_name'];
    $dob = $_POST['Date_of_joining'];
    $Department = $_POST['Department'];
    $Designation = $_POST['Designation'];
    $Qualification = $_POST['Qualification'];
    $area_of_special = $_POST['area_of_special'];
    $title_of_thesis = $_POST['title_of_thesis'];

$sql = mysql_query("update staff_academics set staff_name='$staff_name',Date_of_joining='$dob',Department='$Department',Designation='$Designation',Qualification='$Qualification',area_of_special='$area_of_special',title_of_thesis='$title_of_thesis' where id='$id'");
if($sql){?>
	<script>
  alert('successfully uploaded');
        window.location.href='academics.php?success';
        </script>
	<?php
}
else
{
	?>
	<script>
	alert('error while uploading file');
	      window.location.href='academics.php?fail';
	      </script>
  <?php
}
}
}
?>
<?php
require('DB/dbcon.php');
if(isset($_GET['id'])){
	if(isset($_POST['upd_file1'])){
		$id = $_GET['id'];
		$file = rand(1000,100000)."-".$_FILES['file1']['name'];
	  $file_loc = $_FILES['file1']['tmp_name'];
	  $file_size = $_FILES['file1']['size'];
	  $file_type = $_FILES['file1']['type'];
	  $folder="document/";
		$new_size = $file_size/10000;
	  // new file size in KB

	  // make file name in lower case
	  $new_file_name = strtolower($file);
	  // make file name in lower case

	  $final_file=str_replace(' ','-',$new_file_name);
if(move_uploaded_file($file_loc,$folder.$final_file)){
	$sql = mysql_query("update staff_academics set file1 = '$final_file' where id='$id'");
	?>
	<script>
  alert('successfully uploaded');
        window.location.href='modify_academics.php?success';
        </script>
	<?php
}
else
{
	?>
	<script>
	alert('error while uploading file');
	      window.location.href='modify_academics.php?fail';
	      </script>
	<?php
}
}
}

?>
<?php
require('DB/dbcon.php');
if(isset($_GET['id'])){
	if(isset($_POST['upd_file2'])){
		$id = $_GET['id'];
		$file = rand(1000,100000)."-".$_FILES['file2']['name'];
	  $file_loc = $_FILES['file2']['tmp_name'];
	  $file_size = $_FILES['file2']['size'];
	  $file_type = $_FILES['file2']['type'];
	  $folder="document/";
		$new_size = $file_size/10000;
	  // new file size in KB

	  // make file name in lower case
	  $new_file_name = strtolower($file);
	  // make file name in lower case

	  $final_file=str_replace(' ','-',$new_file_name);
if(move_uploaded_file($file_loc,$folder.$final_file)){
	$sql = mysql_query("update staff_academics set file2 = '$final_file' where id='$id'");
	?>
	<script>
  alert('successfully uploaded');
        window.location.href='modify_academics.php?success';
        </script>
	<?php
}
else
{
	?>
	<script>
	alert('error while uploading file');
	      window.location.href='modify_academics.php?fail';
	      </script>
	<?php
}
}
}

?>
<?php
require('DB/dbcon.php');
if(isset($_GET['id'])){
	if(isset($_POST['upd_file3'])){
		$id = $_GET['id'];
		$file = rand(1000,100000)."-".$_FILES['file3']['name'];
	  $file_loc = $_FILES['file3']['tmp_name'];
	  $file_size = $_FILES['file3']['size'];
	  $file_type = $_FILES['file3']['type'];
	  $folder="document/";
		$new_size = $file_size/10000;
	  // new file size in KB

	  // make file name in lower case
	  $new_file_name = strtolower($file);
	  // make file name in lower case

	  $final_file=str_replace(' ','-',$new_file_name);
if(move_uploaded_file($file_loc,$folder.$final_file)){
	$sql = mysql_query("update staff_academics set file3 = '$final_file' where id='$id'");
	?>
	<script>
  alert('successfully uploaded');
        window.location.href='modify_academics.php?success';
        </script>
	<?php
}
else
{
	?>
	<script>
	alert('error while uploading file');
	      window.location.href='modify_academics.php?fail';
	      </script>
	<?php
}
}
}

?>
