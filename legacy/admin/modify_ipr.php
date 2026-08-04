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
	<title>IPR</title>
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
	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate"> Intellectual property Right </marquee></b></div>
	<form action=" " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>
<div class="form-control"><br>
			<center><h3 style="color: #682D87;">Intellectual Property Right</h3></center><hr>
		<table align="center">
<tr><td>Staff ID</td>
  <td><input type="number" class="form-control col-lg-10" name="staff_id"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_id = $_GET['staff_id'];
      echo $staff_id;
    }?>"  style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Staff Name</td>
  <td><input type="text" class="form-control col-lg-10" name="staff_name"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_name = $_GET['staff_name'];
      echo $staff_name;
    }
    ?>"
      style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Patent Number</td>
  <td><input type="number" class="form-control col-lg-10" name="patent"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $patent = $_GET['patent'];
      echo $patent;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Application No & Reference</td>
  <td><input type="text" class="form-control col-lg-10" name="institution"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $institution = $_GET['institution'];
      echo $institution;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Date/Month/year of the Patent generation&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
  <td><input type="date" class="form-control col-lg-10" name="generation"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $generation = $_GET['generation'];
      echo $generation;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Purpose of IPR</td>
  <td><input class="form-control col-lg-10"  type="text" name="propose"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $propose = $_GET['propose'];
      echo $propose;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></textarea></td></tr>
		<tr><td>Document Name</td>
		<td><input type="text" class="form-control" name="file"
			value="<?php
			if(isset($_GET['id'])){
				$id = $_GET['id'];
				$file = $_GET['file'];
				echo $file;
			}
			?>"
			style='background-color:white; font-weight:bold;' required></td></tr>
			<tr><td><input class="btn btn-outline-primary" style="cursor: pointer; width: 300px;" type='file' name='file'></td>
				<td><input class="btn btn-outline-info" style="cursor: pointer;" type='submit' name='sub_file'></td>
			</tr>
<tr><td>&nbsp;</td><td><br><input type="submit" class="btn btn-outline-success" onclick="window.location.reload(true)" style="cursor: pointer;" name="submit" value="Update"></td><td>&nbsp;</td><td><br>
	<center><a href="ipr_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $patent = $_POST['patent'];
    $institution = $_POST['institution'];
    $generation = $_POST['generation'];
    $propose = $_POST['propose'];
    $sql = mysql_query("update staff_ipr set patent='$patent',institution='$institution',generation='$generation',
    propose='$propose' where id='$id'");
    if($sql){?>
			<script>
		  alert('successfully uploaded');
		        window.location.href='ipr_test.php?success';
		        </script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('error while uploading file');
			      window.location.href='ipr_test.php?fail';
			      </script>
      <?php
    }
  }
}
?>
<?php
require('DB/dbcon.php');
if(isset($_GET['id'])){
	if(isset($_POST['sub_file'])){
		$file = rand(1000,100000)."-".$_FILES['file']['name'];
	  $file_loc = $_FILES['file']['tmp_name'];
	 $file_size = $_FILES['file']['size'];
	 $file_type = $_FILES['file']['type1'];
	 $folder="document/";

	 // new file size in KB
	 $new_size = $file_size/10000;
	 // new file size in KB

	 // make file name in lower case
	 $new_file_name = strtolower($file);
	 // make file name in lower case

	 $final_file=str_replace(' ','-',$new_file_name);

	 if(move_uploaded_file($file_loc,$folder.$final_file)){
		 $sql = mysql_query("update staff_ipr set file='$final_file' where id = '$id'");
		?>
		<script>
	  alert('successfully uploaded');
	        window.location.href='ipr_test.php?success';
	        </script>
					<?php
			   }
			   else
			   {
			    ?>
					<script>
				  alert('error while uploading file');
				        window.location.href='ipr_test.php?fail';
				        </script>
				  <?php
				 }
				}
			}
				?>
