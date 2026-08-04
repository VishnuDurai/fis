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
  <title>RESEARCH SCHOLARS</title>
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
$sql = "select * from staff_scholars order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">RESEARCH SCHOLARS INFORMATION</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
 <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<div class="form-inline">
  <td><input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>
      <p>&nbsp;</p>
&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/></td>
<a href="scholar_test.php"><button type="button" style="margin-left: 30px; cursor: pointer;"
class="btn btn-primary"> Refresh </button></a>
     <tr></tr></div></div></div>
     <div class="pad">
<table class="table table-sm table-hover table-bordered table-striped" id="myTable" style="margin-top: 40px;">

  <thead class="table-success"><tr>
  <th>Staff Id</th>
  <th>Research Scholar ID</th>
  <th>Staff name</th>
  <th>University</th>
  <th>Supervisor Name</th>
  <th>Designation</th>
  <th>Organisation</th>
  <th>Status</th>
  <th></th>
  <th></th>
  <th></th>
  </tr>
  </thead>
  </thead>
  <?php
  $sql = "select * from staff_scholars";

  $result = mysql_query($sql);
  while($abc = mysql_fetch_array($result)){
  $id = $abc['id'];
  $staff_id = $abc['staff_id'];
  $res_id = $abc['res_id'];
  $staff_name = $abc['staff_name'];
  $university = $abc['university'];
  $sup_name = $abc['sup_name'];
  $desgination =  $abc['desgination'];
  $organisation = $abc['organisation'];
  $status = $abc['status'];
  $file = $abc['file'];
  ?>
  <tbody class="table-warning">
  <tr>
    <td><?php echo $abc['staff_id']?></td>
    <td><?php echo $abc['res_id']?></td>
    <td><?php echo $abc['staff_name']?></td>
    <td><?php echo $abc['university']?></td>
    <td><?php echo $abc['sup_name']?></td>
    <td><?php echo $abc['desgination']?></td>
    <td><?php echo $abc['organisation']?></td>
    <td><?php echo $abc['status']?></td>
    <td><a href="document/<?php echo $abc['file']; ?>" target="_blank">View</a></td>

  <td><?php echo "<a href='modify_scholars.php?id=$id&staff_id=$staff_id&staff_name=$staff_name&res_id=$res_id&university=$university&sup_name=$sup_name&desgination=$desgination&organisation=$organisation&status=$status&file=$file' >Modify</a>" ?> </td>
  <td><?php echo "<a href='scholar_test.php?del=$abc[id]'>Delete</a>"; ?></td>
  </tr>
  </tbody>
  <?php
  }
  ?></table>
</div>
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
	$sql = "delete from staff_scholars where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{
	?>
  <script>
  alert('successfully Deleted');
        window.location.href='scholar_test.php?success';
        </script>
  <?php
}
else
{
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='scholar_test.php?fail';
        </script>
  <?php
}

}
?>
