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
  <title>RESEARCH SUPERVISOR</title>
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
$sql = "select * from staff_supervisor order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">RESEARCH SUPERVISOR INFORMATION</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
   <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
<div class="form-inline">
  <td><input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>
      <p>&nbsp;</p>
&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/></td>
   <tr><td><button style="margin-left:50%;cursor:pointer;" class="btn btn-primary">Refresh</button></td></tr>
</div></div></div>
<div class="pad">
<table class="table table-sm table-hover table-bordered table-striped" id="myTable" style="margin-top: 40px;">

  <thead class="table-success"><tr>
  <th>Staff Id</th>
  <th>Research Scholar ID</th>
  <th>Supervisor Name</th>
  <th>University&nbsp;&nbsp;&nbsp;&nbsp;</th>
  <th>No of Internal Research Scholars</th>
  <th>No of External Research Scholars</th>
  <th>No of Scholars Completed PHD</th>

  <th>update</th>
  <th>delete</th>
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
  echo '<input type="number" style="width:60px; border:none; background-color:#FDF8E4;" value="'.$abc['res_sup_id'].'" name="res_sup_id'.$i.'" />';
  echo "</td>";
  echo "<td>";
  echo '<input type="text" style="border:none; background-color:#FDF8E4;" value="'.$abc['staff_name'].'" name="name'.$i.'" readonly/>';
  echo "</td>";
  echo "<td>";
  echo '<input type="text" style="width:110px; border:none; background-color:#FDF8E4;" value="'.$abc['university'].'" name="university'.$i.'" />';
  echo "</td>";
  echo "<td>";
  echo '<input type="number" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['internal'].'" name="internal'.$i.'" />';
  echo "</td>";
  echo "<td>";
  echo '<input type="number" style="width:100px; border:none; background-color:#FDF8E4;" value="'.$abc['external'].'" name="external'.$i.'" />';
  echo "</td>";
   echo "<td>";
  echo '<input type="text" style="width:170px; border:none; background-color:#FDF8E4;" value="'.$abc['scholar'].'" name="scholar'.$i.'" />';
  echo "</td>";

  echo "<td>";

  echo '<input type="submit" value="+" class="btn btn-sm btn-outline-warning" name="update'.$i.'"/>';
  if(isset($_POST['update'.$i.'']))

  {
    if(isset($_POST['check'.$i.'']))
    {
      $id = $_POST['id'.$i.''];
      $type = $_POST['res_sup_id'.$i.''];
      $title = $_POST['university'.$i.''];
      $from = $_POST['internal'.$i.''];
      $to=$_POST['external'.$i.''];
      $org = $_POST['scholar'.$i.''];


      $update = "update staff_supervisor set res_sup_id='$type',university='$title',internal='$from',external='$to',scholar='$org' where id='$id' ";

      $qry = mysql_query($update);
      if(!$qry){echo "UPDATED FAILED";}
      else
      {

        header("location:supervisor.php");
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

      $delete = "delete from staff_supervisor where id='$id'";

      $qry = mysql_query($delete);
      if(!$qry){echo "Deletion failed";}else{
        header("location:supervisor.php");
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
    ?></table>
  </div></form>

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
