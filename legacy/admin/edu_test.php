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
$sql = "select * from staff_interaction order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF EDUCATION DETAILS</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
<form method="post" action="<?php echo $_SERVER['PHP_SELF'] ?>">
  <div class="form-inline">
 <input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/><p>&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;
 <input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/><p>&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;
 <input type="text" id="myInput2" class="form-control" onkeyup="myFunction2()" placeholder="Search Department" style='background-color:white; font-weight:bold; width: 200px;'/><p>&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;

   <a href="edu_test.php"><button type="button" style="margin-left: 30px; cursor: pointer;"
   class="btn btn-primary"> Refresh </button></a>
</div>
</div></div><div class="pad">
<table class="table table-sm table-bordered table-hover table-striped" id="myTable" style="margin-top: 40px;">
  <thead class="table-success"><tr>
    <th>Staff Id</th>
    <th>Staff Name</th>
    <th>Desgination</th>
    <th>Department</th>
    <th>Category</th>
    <th>Specialization</th>
    <th>Institute</th>
    <th>Board</th>
    <th>Year</th>
    <th>Percentage</th>
    <th></th>
    <th> </th>
    <th></th>
    </tr>
  </thead>
  <?php
  $sql = "select a.Department,a.Designation,a.staff_name,i.id,i.file,i.staff_id,i.category,i.specialization,i.institute,i.board,i.year,i.percentage from staff_academics a,staff_edu i where i.staff_id=a.staff_id order by a.Department";
  $result = mysql_query($sql);
  while($row = mysql_fetch_array($result)){
    $id = $row['id'];
    $staff_id = $row['staff_id'];
    $staff_name = $row['staff_name'];
    $category = $row['category'];
    $specialization = $row['specialization'];
    $institute = $row['institute'];
    $board = $row['board'];
    $year = $row['year'];
    $percentage = $row['percentage'];
    $file = $row['file'];
  ?>
  <tbody class="table-warning">
      <tr>
        <td><?php echo $row['staff_id']; ?></td>
        <td><?php echo $row['staff_name']; ?></td>
        <td><?php echo $row['Designation']; ?></td>
        <td><?php echo $row['Department']; ?></td>
        <td><?php echo $row['category']; ?></td>
        <td><?php echo $row['specialization']; ?></td>
        <td><?php echo $row['institute']; ?></td>
        <td><?php echo $row['board']; ?></td>
        <td><?php echo $row['year']; ?></td>
        <td><?php echo $row['percentage']; ?></td>
        <td><a href="document/<?php echo $row['file']; ?>" target="_blank">View</a></td>
        <td><?php echo "<a href='modify_edu_test.php?id=$id&staff_id=$staff_id&staff_name=$staff_name&category=$category&specialization=$specialization&institute=$institute&board=$board&year=$year&percentage=$percentage&file=$file' >Modify</a>" ?> </td>
        <td><?php echo "<a href='edu_test.php?del=$row[id]'>Delete</a>"; ?></td>
      </tr>

    </tbody>
<?php
  }
  ?>
</table></div>
      </form>
<hr>
</div>
</body>
</html>
<script>
function myFunction() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
<script>
function myFunction1() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput1");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
<script>
function myFunction2() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput2");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[3];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
<script>
function myFunction3() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput3");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[2];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_edu where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{?>
  <script>
  alert('successfully Deleted');
        window.location.href='edu_test.php?success';
        </script>
  <?php
}
else
{
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='edu_test.php?fail';
        </script>
	<?php
}

}
?>
