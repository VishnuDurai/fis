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
  <title>PUBLICATION</title>
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
  <?php
$sql = "select * from staff_publication order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF PUBLICATION DETAILS</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
    <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
      <div class="form-inline">
     <td><input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/><p>&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;
       <input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/><p>&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;
       <input type="text" id="myInput2" class="form-control" onkeyup="myFunction2()" placeholder="Search Department" style='background-color:white; font-weight:bold; width: 200px;'/>
       <a href="publication_test.php"><button type="button" style="margin-left: 30px; cursor: pointer;"
       class="btn btn-primary"> Refresh </button></a>
    </td>

    <tr></tr></div>
  </div></div>
<table class="table table-bordered table-hover table-striped" id="myTable" style="margin-top: 40px;">
  <thead class="table-success"><tr>
  <th>Staff ID</th>
  <th style="width:200px; text-align:center;">Staff name</th>

  <th>Designation</th>
  <th>Department</th>
  <th style="width:200px; text-align:center;">Type of Publication</th>
  <th style="width:100px; text-align:center;">Type</th>
  <th style="width:100px; text-align:center;">Title</th>
  <th style="width:100px; text-align:center;">Name of Journal/Conference</th>
  <th style="width:100px; text-align:center;">Date of conference</th>
  <th style="width:100px; text-align:center;">Organizer(conference)</th>
  <th style="width:100px; text-align:center;">DOI</th>
  <th style="width:100px; text-align:center;">ISSN/ISBN</th>
  <th style="width:100px; text-align:center;">Month</th>
  <th style="width:100px; text-align:center;">Volume</th>
  <th style="width:100px; text-align:center;">PP</th>
  <th>Scopus Indexed</th>
  <th>Citations</th>
  <th>H-index</th>
  <th>Impact Factor</th>
  <th></th>
  <th></th>
  <th></th>
  </tr>
  </thead>
  <?php
  $sql = "select a.Department,a.Designation,i.id,i.file,i.staff_id,i.staff_name
  ,i.type_pub,i.type,i.title,i.journel,i.date_con,i.organizer,i.doi,i.isbn,
  i.month_pub,i.volume_pub,i.pp,i.index_pub,i.citations,i.hindex,
  i.impact from staff_academics a,staff_publication i where i.staff_id=a.staff_id";
  $result = mysql_query($sql);
  while($abc = mysql_fetch_array($result)){
    $id = $abc['id'];
    $staff_id = $abc['staff_id'];
    $staff_name = $abc['staff_name'];
    $type_pub = $abc['type_pub'];
    $type = $abc['type'];
    $title = $abc['title'];
    $journel = $abc['journel'];
    $date_con = $abc['date_con'];
    $organizer = $abc['organizer'];
    $doi = $abc['doi'];
    $isbn = $abc['isbn'];
    $month_pub = $abc['month_pub'];
    $volume_pub = $abc['volume_pub'];
    $pp = $abc['pp'];
    $index_pub = $abc['index_pub'];
    $citations = $abc['citations'];
    $hindex = $abc['hindex'];
    $impact = $abc['impact'];
    $file = $abc['file'];
  ?>
  <tbody class="table-warning">
    <tr>
      <td><?php echo $abc['staff_id']?></td>
      <td><?php echo $abc['staff_name']?></td>

      <td><?php echo $abc['Designation']; ?></td>
      <td><?php echo $abc['Department']; ?></td>
      <td><?php echo $abc['type_pub']?></td>
      <td><?php echo $abc['type']?></td>
      <td><?php echo $abc['title']?></td>
      <td><?php echo $abc['journel']?></td>
      <td><?php echo $abc['date_con']?></td>
      <td><?php echo $abc['organizer']?></td>
      <td><?php echo $abc['doi']?></td>
      <td><?php echo $abc['isbn']?></td>
      <td><?php echo $abc['month_pub']?></td>
      <td><?php echo $abc['volume_pub']?></td>
      <td><?php echo $abc['pp']?></td>
      <td><?php echo $abc['index_pub']?></td>
      <td><?php echo $abc['citations']?></td>
      <td><?php echo $abc['hindex']?></td>
      <td><?php echo $abc['impact']?></td>
      <td><a href="document/<?php echo $abc['file']; ?>" target="_blank">View</a></td>
  <td><?php echo "<a href='modify_publication.php?id=$id&staff_id=$staff_id&staff_name=$staff_name&type_pub=$type_pub&type=$type&title=$title&journel=$journel&date_con=$date_con&organizer=$organizer&doi=$doi&isbn=$isbn&month_pub=$month_pub&volume_pub=$volume_pub&pp=$pp&index_pub=$index_pub&citations=$citations&hindex=$hindex&impact=$impact&file=$file'>Modify</a>" ?> </td>
  <td><?php echo "<a href='publication_test.php?del=$abc[id]'>Delete</a>"; ?></td>
  </tr>
  </tbody>
  <?php
  }
  ?>
  </table>

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
<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_publication where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{?>
  <script>
  alert('successfully Deleted');
        window.location.href='publication_test.php?success';
        </script>
  <?php
}
else
{
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='publication_test.php?fail';
        </script>
	<?php
}
}
?>
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
