<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id'])){
  header("location:access-denied.php");
}

?>
<!DOCTYPE html>
<html>
<head>
  <title>INTERACTION</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<style>
.pad{
  padding: 7px;
}
</style>
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
    <?php
$sql = "select * from staff_resource order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF INTERACTION DETAILS</marquee></b></div>
 <center><h3></h3></center>
  <hr>
<div class="pad">
<table class="table table-sm table-bordered table-hover table-striped" id="myTable" style="margin-top: 40px;">
  <thead class="table-success"><tr>
    <th>S.No</th>
  <th>Staff Id</th>
  <th>Staff name</th>
  <th>Designation</th>
  <th>Department</th>
  <th>Type</th>
  <th>Title</th>
  <th>Acted As</th>
  <th>From Date</th>
  <th>To Date</th>
  <th>Organizer</th>
  <th>No.of Benificiaries</th>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  </tr>
  </thead>
  <?php
  require ('DB/dbcon.php');
  if(isset($_POST['submit1'])){
  $sql = "select a.Department,a.Designation,i.id,i.file,i.staff_id,i.staff_name,i.type,i.title,i.actedas,i.from_date,i.to_date,i.organizer,i.ben,i.date from staff_academics a,staff_resource i where i.staff_id=a.staff_id and i.from_date between '".$_POST['from']."' and '".$_POST['to']."' order by i.from_date";
  $s=1;
  $result = mysql_query($sql);
  while($row = mysql_fetch_array($result)){
    $id = $row['id'];
    $staff_id = $row['staff_id'];
    $staff_name = $row['staff_name'];
    $des = $row['Designation'];
    $dep = $row['Department'];
    $type = $row['type'];
    $title = $row['title'];
    $journel = $row['actedas'];
    $fromdate = $row['from_date'];
    $todate = $row['to_date'];
    $organizer = $row['organizer'];
    $ben = $row['ben'];
    $d = $row['date'];
    $file = $row['file'];
      ?>
  <tbody class="table-warning">
      <tr>
        <td><?php echo $s; ?></td>
        <td><?php echo $row['staff_id']; ?></td>
        <td><?php echo $row['staff_name']; ?></td>
        <td><?php echo $row['Designation']; ?></td>
        <td><?php echo $row['Department']; ?></td>
        <td><?php echo $row['type']; ?></td>
        <td><?php echo $row['title']; ?></td>
        <td><?php echo $row['actedas']; ?></td>
        <td><?php echo $row['from_date']; ?></td>
        <td><?php echo $row['to_date']; ?></td>
        <td><?php echo $row['organizer']; ?></td>
        <td><?php echo $row['ben']; ?></td>
        <td><?php echo $row['date']; ?></td>
        <td><a href="document/<?php echo $row['file']; ?>" target="_blank">View</a></td>
        <td><?php echo "<a href='modify_resource.php?id=$id&staff_id=$staff_id&staff_name=$staff_name&type=$type&title=$title&from_date=$from&to_date=$to&organizer=$organizer&file=$file' >Modify</a>" ?> </td>
<td><?php echo "<a href='resource_test.php?del=$row[id]'>Delete</a>"; ?></td>
      </tr>
    </tbody>
<?php
$s++;
  }
}
  ?>
</table></div>
      </form>
<hr>
</div>
</body>
</html>
<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_resource where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{?>
  <script>
  alert('successfully Deleted');
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
?>
