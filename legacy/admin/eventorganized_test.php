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
  <title>EVENT ORGANIZED</title>
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
$sql = "select * from staff_event_organized order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">EVENT ORGANIZED INFORMATION</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
 <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<div class="form-inline">
  <td>&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>
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
  <td>&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff Name" style='background-color:white; font-weight:bold; width: 200px;'/>
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

  <td>&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput2" class="form-control" onkeyup="myFunction2()" placeholder="Search Department" style='background-color:white; font-weight:bold; width: 200px;'/>
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
  <td>&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput3" class="form-control" onkeyup="myFunction3()" placeholder="Search Type" style='background-color:white; font-weight:bold; width: 200px;'/>
      <script>
function myFunction3() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput3");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[4];
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
<a href="eventorganized_test.php"><button type="button" style="margin-left: 30px; cursor: pointer;"
     class="btn btn-primary"> Refresh </button></a>
     <tr></tr></div></div></div>
     <div class="pad">
<table class="table table-bordered table-hover table-sm table-striped" id="myTable" style=" margin-top: 40px;">
  <thead class="table-success"><tr>
  <th>Staff ID</th>
  <th>Staff Name</th>
  <th>Designation</th>
  <th>Department</th>
  <th>Type</th>
  <th>Title</th>
  <th>From</th>
  <th>To</th>
  <th>Organizer</th>
  <th>Resource Person</th>
  <th>No of Beneficiaries</th>
  <th>Sponsorship</th>
  <th>Grants</th>
  <th></th>
  <th></th>
  </tr>
  </thead>
  <?php
  $sql = "select a.Department,a.Designation,a.staff_name,i.id,i.staff_id,i.res_person,i.type,i.title,i.ben_person,i.from_date,i.to_date,i.organizer,i.sponsership,i.granted from staff_academics a,staff_event_organized i where i.staff_id=a.staff_id order by i.from_date";

  $result = mysql_query($sql);
  while($abc = mysql_fetch_array($result)){
    $id = $abc['id'];
    $staff_id = $abc['staff_id'];

    $type = $abc['type'];
    $title = $abc['title'];
    $from_date = $abc['from_date'];
    $to_date = $abc['to_date'];
    $organizer = $abc['organizer'];
    $res_person = $abc['res_person'];
    $ben_person = $abc['ben_person'];
    $sponsership = $abc['sponsership'];
    $granted = $abc['granted'];
    ?>
    <tbody class="table-warning">
      <tr>
        <td><?php echo $abc['staff_id']?></td>
        <td><?php echo $abc['staff_name']?></td>
        <td><?php echo $abc['Designation']; ?></td>
        <td><?php echo $abc['Department']; ?></td>
        <td><?php echo $abc['type']?></td>
         <td><?php echo $abc['title']?></td>
        <td><?php echo $abc['from_date']?></td>
        <td><?php echo $abc['to_date']?></td>
        <td><?php echo $abc['organizer']?></td>
        <td><?php echo $abc['res_person']?></td>
        <td><?php echo $abc['ben_person']?></td>
        <td><?php echo $abc['sponsership']?></td>
        <td><?php echo $abc['granted']?></td>
<td><?php echo "<a href='modify_event.php?id=$id&staff_id=$staff_id&type=$type&title=$title&from_date=$from_date&to_date=$to_date&organizer=$organizer&res_person=$res_person&ben_person=$ben_person&sponsership=$sponsership&granted=$granted'>Modify</a>" ?> </td>
<td><?php echo "<a href='eventorganized_test.php?del=$abc[id]'>Delete</a>"; ?></td>
      </tr>
    </tbody>
  <?php
  }
  ?>
     </table>
</div>
   </form>

  <hr>

</div>
</body>
</html>
<!--<script>
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
    td = tr[i].getElementsByTagName("td")[4];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>-->
<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_event_organized where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{
	?>
  <script>
  alert('successfully Deleted');
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
?>
