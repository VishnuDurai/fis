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
	<title>Book Published</title>
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

	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Competitive Exam</marquee></b></div>

	<form action=" " onsubmit="return registerValidate(this)" method="post" enctype="multipart/form-data"><hr>

		<div class="form-control"><br>
			<center><h3 style="color: #682D87;">Innovative Project</h3></center><hr>
		<table align="center">
<tr><td>Staff ID:</td>
  <td><input type="number" class="form-control" name="staff_id"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_id = $_GET['staff_id'];
    echo $staff_id;
  }?>"
   style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Staff Name: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
  <td><input type="text" class="form-control col-lg" name="staff_name"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_name = $_GET['staff_name'];
      echo $staff_name;
    }?>"  style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Project Title:</td>
  <td><input type="text" class="form-control" name="project_title"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $title = $_GET['project_title'];
      echo $title;
    }?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Description of the Project:</td>
  <td><input type="text" class="form-control" name="description"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $coauthor = $_GET['description'];
      echo $coauthor;
    }?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Status</td>
  <td><input type="text" class="form-control" name="status"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $publisher = $_GET['status'];
      echo $publisher;
    }?>"
      style='background-color:white; font-weight:bold;' required></td></tr>
		</tr>
 <tr><td>&nbsp;</td><td>
   <br><input type="submit" class="btn btn-outline-success" style="cursor: pointer;" name="submit" value="Update"></td><td>&nbsp;</td><td><br><center>
	 <a href="innovative_pre_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $title = $_POST['project_title'];
    $coauthor = $_POST['description'];
    $publisher = $_POST['status'];
    $sql = mysql_query("update staff_innovative set project_title='$title',description='$coauthor',status='$publisher' where id='$id' ");
    if($sql){?>
			<script>
		  alert('successfully uploaded');
		        window.location.href='innovative_test.php?success';
		        </script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('error while uploading file');
			      window.location.href='innovative_test.php?fail';
			      </script>
<?php
	  }
  }
}
?>
