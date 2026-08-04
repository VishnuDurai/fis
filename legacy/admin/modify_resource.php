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

	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Resource Person</marquee></b></div>

	<form action="  " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>

		<div class="form-control"><br>
			<center><h3 style="color: #682D87;">Resource Person</h3></center><hr>
		<table align="center">
<tr><td>Faculty ID</td><td><input type="number" class="form-control" name="staff_id"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_id = $_GET['staff_id'];
    echo $staff_id;
  }?>"
   style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Faculty Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
  <td><input type="text" class="form-control" name="staff_name"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_name = $_GET['staff_name'];
      echo $staff_name;
    }
    ?>"
      style='background-color:white; font-weight:bold;' readonly></td></tr>
<tr><td>Type</td>
  <td><input name="type" class="form-control"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $type = $_GET['type'];
      echo $type;
    }
    ?>"
     style='background-color:white; font-weight:bold; margin-left: 1px; width: 197px;'>
					</td></tr>
<tr><td>Title</td>
  <td><input type="text" class="form-control" name="title"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $title = $_GET['title'];
      echo $title;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Acted As</td>
  <td><input type="text" class="form-control" name="actedas"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $actedas = $_GET['actedas'];
      echo $actedas;
    }
    ?>"
   style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>From Date</td><td><input type="date" class="form-control" name="from_date"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $from_date = $_GET['from_date'];
    echo $from_date;
  }
  ?>"
    style='background-color:white; font-weight:bold;' required></td><tr>
<td>To Date</td>
<td><input type="date" class="form-control col-lg-12" name="to_date"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $to_date = $_GET['to_date'];
    echo $to_date;
  }
  ?>"
   style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Organizer</td>
  <td><input type="text" class="form-control" name="organizer"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $organizer = $_GET['organizer'];
      echo $organizer;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>

<tr><td>No of Beneficery</td>
  <td><input type="number" class="form-control" name="ben"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $ben = $_GET['ben'];
      echo $ben;
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
<tr><td>&nbsp;</td><td><br><input type="submit" class="btn btn-outline-success" style="cursor: pointer;" name="submit" value="Update"></td><td>&nbsp;</td>

	<td><br><center><a href="resource_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $title = $_POST['title'];
    $actedas = $_POST['actedas'];
    $from = $_POST['from_date'];
    $to = $_POST['to_date'];
    $org = $_POST['organizer'];
    $ben = $_POST['ben'];
    $sql = mysql_query("update staff_resource set type='$type',title='$title',actedas='$actedas',from_date='$from',
		to_date='$to',organizer='$org',ben='$ben' where id='$id'");
		if($sql){?>
			<script>
		  alert('successfully uploaded');
		        window.location.href='resource_test.php?success';
		        </script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('error while uploading file');
			      window.location.href='resource_test.php?fail';
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
		 $sql = mysql_query("update staff_resource set file='$final_file' where id = '$id'");
		?>
		<script>
	  alert('successfully uploaded');
	        window.location.href='resource_test.php?success';
	        </script>
					<?php
			   }
			   else
			   {
			    ?>
					<script>
				  alert('error while uploading file');
				        window.location.href='resource_test.php?fail';
				        </script>
				  <?php
				 }
				}
			}
				?>
