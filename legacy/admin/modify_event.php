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
	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Events Organized</marquee></b></div>

	<form action=" " onsubmit="return registerValidate(this)" method="post"><hr>

		<div class="form-control"><br>
			<center><h3 style="color: #682D87;">Events Organized</h3></center><hr>
		<table align="center">
		<tr><td>Staff ID</td><td><input type="number" class="form-control" name="staff_id"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $staff_id = $_GET['staff_id'];
        echo $staff_id;
      }?>"
       style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Type</td>
  <td><input name="type"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $type = $_GET['type'];
      echo $type;
    }?>"
     class="form-control" style='background-color:white; font-weight:bold;'>
					</td></tr>
<tr><td>Title</td>
  <td><input type="text" name="title" class="form-control"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $title = $_GET['title'];
      echo $title;
    }?>"

    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>From Date</td>
  <td><input type="date" name="from_date" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $from_date = $_GET['from_date'];
      echo $from_date;
    }?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
    <td>To Date&nbsp;&nbsp;&nbsp;&nbsp;</td>
    <td><input type="date" class="form-control col-lg-10" name="to_date"
      value="<?php
      if(isset($_GET['id'])){
        $id = $_GET['id'];
        $to_date = $_GET['to_date'];
        echo $to_date;
      }?>"
       style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Organizer</td>
  <td><input type="text" name="organizer" class="form-control"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $organizer = $_GET['organizer'];
      echo $organizer;
    }?>"
      style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Resource Person</td>
  <td><input type="text" class="form-control" name="res_person"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $res_person = $_GET['res_person'];
      echo $res_person;
    }?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>No Of Beneficiaries</td>
  <td><input type="number" class="form-control" name="ben_person"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $ben_person = $_GET['ben_person'];
      echo $ben_person;
    }?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Sponsership(if any)</td>
  <td><input type="text" class="form-control" name="sponsership"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $sponsership = $_GET['sponsership'];
      echo $sponsership;
    }?>"
     style='background-color:white; font-weight:bold;' ></td></tr>
<tr><td>Grants(if any)</td>
  <td><input type="text" class="form-control"
    name="granted"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $granted = $_GET['granted'];
      echo $granted;
    }?>"
     style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>&nbsp;</td><td><br>
	<input type="submit" name="submit" class="btn btn-outline-success" style="cursor: pointer;" value="Update"></td><td>&nbsp;</td>

  <td><br>
<center><a href="eventorganized_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
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
    $from_date = $_POST['from_date'];
    $to_date = $_POST['to_date'];
    $organizer = $_POST['organizer'];
    $res_person = $_POST['res_person'];
    $ben_person = $_POST['ben_person'];
    $sponsership = $_POST['sponsership'];
    $granted = $_POST['granted'];
    $sql = "update staff_event_organized set type='$type',title='$title',from_date='$from_date',to_date='$to_date',
    organizer='$organizer',res_person='$res_person',ben_person='$ben_person',sponsership='$sponsership',granted='$granted' where id='$id'";
		$result = mysql_query($sql);

			if($result){?>
				<script>
				alert('successfully uploaded');
							window.location.href='eventorganized_test.php?success';
							</script>
				<?php
			}
			else
			{
				?>
				<script>
				alert('error while uploading file');
				      window.location.href='eventorganized_test.php?fail';
				      </script>
<?php
			}

	}
}

?>
