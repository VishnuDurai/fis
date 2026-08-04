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
	<title>Awards</title>
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
<center><b><font style="color: #176281;"  size="6">SREC IMS</font></b></center><br>
<div id="page">
	<div id="header">
	</div>
	<div class="container">
	<center><?php include('navbar.php');?></center><hr>
	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Awards</marquee></b></div>
	<form action=" " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>

		<div class="form-control"><br>
			<center><h3 style="color: #682D87;">Award Details</h3></center><hr>
		<table align="center">
<tr><td>Staff ID</td>
  <td><input type="number" class="form-control col-lg" name="staff_id"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_id = $_GET['staff_id'];
      echo $staff_id;
    }?>"
     style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Staff Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
  <td><input type="text" class="form-control col-lg" name="staff_name"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_name = $_GET['staff_name'];
      echo $staff_name;
    }
    ?>"
     readonly style='background-color:white; font-weight:bold;' ></td></tr>
<tr><td>Award Name</td>
  <td><input type="text" class="form-control col-lg" name="awardname"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $awardname = $_GET['awardname'];
      echo $awardname;
    }
    ?>"

    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Awarded By</td>
  <td><input type="text" class="form-control col-lg" name="awardby"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $awardby = $_GET['awardby'];
      echo $awardby;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Event</td>
  <td><input type="text" class="form-control col-lg" name="event"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $event = $_GET['event'];
      echo $event;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
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
<tr><td>&nbsp;</td><td><br><input type="submit" onclick="window.location.reload(true)" class="btn btn-outline-success" style="cursor: pointer;" name="submit" value="Update"></td><td>&nbsp;</td>
  <td><br><center>
	<a href="award_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $awardname = $_POST['awardname'];
    $awardby = $_POST['awardby'];
    $event = $_POST['event'];
    $sql = mysql_query("update staff_award set awardname='$awardname',awardby='$awardby',event='$event' where id='$id'");
    if($sql)
		{?>
			<script>
		  alert('successfully uploaded');
		        window.location.href='award_test.php?success';
		        </script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('error while uploading file');
			      window.location.href='award_test.php?fail';
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
		 $sql = mysql_query("update staff_award set file='$final_file' where id = '$id'");
		?>
		<script>
	  alert('successfully uploaded');
	        window.location.href='award_test.php?success';
	        </script>
					<?php
			   }
			   else
			   {
			    ?>
					<script>
				  alert('error while uploading file');
				        window.location.href='award_test.php?fail';
				        </script>
				  <?php
				 }
				}
			}
				?>
