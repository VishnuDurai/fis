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
  <title>AWARD</title>
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
    <?php include('DB/dbcon.php');?>
<?php
$sql = "select * from staff_award order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF AWARD INFORMATION</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
 <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<div class="form-inline">
  <td><input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>
      <p>&nbsp;</p>
&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/></td>
     <tr><td><button style="margin-left:3%;cursor:pointer;" class="btn btn-primary">Refresh</button></td></tr></div></div></div>
     <div class="pad">
<table class="table table-bordered table-sm table-hover table-striped" id="myTable" style=" margin-top: 40px;">

  <thead class="table-success"><tr>
  <th>Staff Id</th>
  <th>Staff name</th>
  <th>Award Name&nbsp;&nbsp;&nbsp;&nbsp;</th>
  <th>Award By</th>
  <th>Event</th>
  <th>Date of Entry</th>
  <th>View</th>
      <th>Update</th>
      <th>Delete</th>
      <th>*</th></tr>
  </thead>
  <?php
while($abc = mysql_fetch_array($result)){

  echo "<tr class='table-warning'>";

  echo '<input type="hidden" style="width:30px;" value="'.$abc['id'].'" name="id'.$i.'" readonly/>';

  echo "<td>";
  echo '<input type="number" style="width:60px; border:none; background-color:#FDF8E4;" value="'.$abc['staff_id'].'" name="ids'.$i.'" readonly/>';
  echo "</td>";
  echo "<td>";
  echo '<input type="text" style="border:none; background-color:#FDF8E4;" value="'.$abc['staff_name'].'" name="name'.$i.'" readonly/>';
  echo "</td>";
  echo "<td>";
  echo '<input type="text" style="width:110px; border:none; background-color:#FDF8E4;" value="'.$abc['awardname'].'" name="awardname'.$i.'" />';
  echo "</td>";
  echo "<td>";
  echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['awardby'].'" name="awardby'.$i.'" />';
  echo "</td>";
  echo "<td>";
  echo '<input type="text" style="width:100px; border:none; background-color:#FDF8E4;" value="'.$abc['event'].'" name="event'.$i.'" />';
  echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['date'].'" />';
    echo "</td>";
    ?>
    <td><?php echo "<a href='delete.php?del=$row[title]'></a>"; ?>&nbsp;&nbsp;&nbsp;
      <a href="document/<?php echo $abc['file']; ?>" target="_blank">view</a></td>
    <?php
  echo "<td>";

  echo '<input type="submit" value="+" class="btn btn-sm btn-outline-warning" name="update'.$i.'"/>';
  if(isset($_POST['update'.$i.'']))

  {
    if(isset($_POST['check'.$i.'']))
    {
      $id = $_POST['id'.$i.''];
      $type = $_POST['awardname'.$i.''];
      $title = $_POST['awardby'.$i.''];
      $from = $_POST['event'.$i.''];

      $update = "update staff_award set awardname='$type',awardby='$title',event='$from' where id='$id' ";

      $qry = mysql_query($update);
      if(!$qry){echo "UPDATED FAILED";}
      else
      {

        header("location:award.php");
echo "<script type='text/javascript'>alert('Updated successfully !')</script>";
      }
    }
    else {echo "pls select checkbox";}
  }
  echo "</td>";

  echo "<td>";

  echo '<input type="submit" value="X" class="btn btn-sm btn-outline-danger" name="delete'.$i.'"/>';
  if(isset($_POST['delete'.$i.'']))
  {
    if(isset($_POST['check'.$i.''])){
      $id = $_POST['id'.$i.''];

      $delete = "delete from staff_award where id='$id'";

      $qry = mysql_query($delete);
      if(!$qry){echo "Deletion failed";}else{
        header("location:award.php");
        echo "<script type='text/javascript'>alert('deleted successfully !')</script>";
      }

    }
    else{echo "pls select checkbox";}
  }
  echo "</td>";

  echo "<td>";
  echo '<input type="checkbox" name="check'.$i.'" />';
  echo "</td>";

  echo "</tr>";
  $i++;
}
    ?></table></div>
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
