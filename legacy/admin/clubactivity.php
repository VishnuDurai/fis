<?php
session_start();
require ('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Previous entry</title>
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<style>
th{
  width:200px;
  text-align:center;
}
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
.pad{
  padding: 7px;
}
</style>
</head>
<body bgcolor="tan">
<?php include('DB/dbcon.php');?>
<?php
$sql = "select * from staff_event_organized where staff_id = '$_SESSION[staff_id]'";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br><hr>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF CLUB ACTIVITY</marquee></b></div>

	<center><h3></h3></center>
	<hr>
  <div id="form-control">
  <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
</div></div>
<div class="pad">
<table class="table table-sm table-bordered table-hover table-striped" style="margin-top: 40px;">

  <thead class="table-success"><tr>
  <th>S.No</th>
  <th style="width:500px; text-align:center;">Club</th>
  <th>Type</th>
  <th>Title</th>
  <th>From</th>
  <th>To</th>
  <th>Organizer</th>
  <th>Designation</th>
  <th>Department</th>
   <th>Resource Person</th>
  <th>No of Beneficiaries</th>
  <th>Sponsorship</th>
  <th>Grants</th>
  <th></th>
  <th></th>
  </tr>
  </thead>
  <?php
  $sql = "select a.Department,a.Designation,a.staff_name,i.id,i.staff_id,i.club,i.res_person,i.type,i.title,i.ben_person,i.from_date,i.to_date,i.organizer,i.sponsership,i.granted from staff_academics a,staff_club i where i.staff_id=a.staff_id order by i.from_date";
  $s=1;
  $result = mysql_query($sql);
  while($abc = mysql_fetch_array($result)){
    $id = $abc['id'];
    $staff_id = $abc['staff_id'];
    $club = $abc['club'];
    $type = $abc['type'];
    $title = $abc['title'];
    $from_date = $abc['from_date'];
    $to_date = $abc['to_date'];
    //$organizer = $abc['organizer'];
    $res_person = $abc['res_person'];
    $ben_person = $abc['ben_person'];
    $sponsership = $abc['sponsership'];
    $granted = $abc['granted'];
    ?>
    <tbody class="table-warning">
      <tr>
        <td><?php echo $s;?></td>
        <td><?php echo $abc['club']?></td>
        <td><?php echo $abc['type']?></td>
        <td><?php echo $abc['title']?></td>
        <td><?php echo $abc['from_date']?></td>
        <td><?php echo $abc['to_date']?></td>
        <td><?php echo $abc['staff_name']?></td>
        <td><?php echo $abc['Designation']; ?></td>
        <td><?php echo $abc['Department']; ?></td>
        <td><?php echo $abc['res_person']?></td>
        <td><?php echo $abc['ben_person']?></td>
        <td><?php echo $abc['sponsership']?></td>
        <td><?php echo $abc['granted']?></td>
<td><?php echo "<a href='modify_club.php?id=$id&club=$club&type=$type&title=$title&from_date=$from_date&to_date=$to_date&organizer=$organizer&res_person=$res_person&ben_person=$ben_person&sponsership=$sponsership&granted=$granted'>Modify</a>" ?> </td>
<td><?php echo "<a href='clubactivity.php?del=$abc[id]'>Delete</a>"; ?></td>
      </tr>
    </tbody>
  <?php
$s++;
  }
  ?>
    </table></div>
  </form>

  </center>
<hr>
</div>
</body>
</html>

<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_club where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{?>
  <script>
  alert('successfully uploaded');
        window.location.href='clubactivity.php?success';
        </script>
  <?php
}
else
{
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='clubactivity.php?fail';
        </script>
	<?php
}

}
?>
