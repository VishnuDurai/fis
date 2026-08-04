<?php require('../models/restrict.php');
require('../models/dbcon.php');
        mysqli_set_charset($conn,"utf8");
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
$result = mysqli_query($conn,"SELECT * FROM admin_dep WHERE staff_id = '$_SESSION[staff_id]'")
or die("there is no records to display..\n" . mysqli_error());
if(mysqli_num_rows($result)<1)
{
  $result = null;
}

$row = mysqli_fetch_array($result);

if($row)
{
  $id = $row['staff_id'];
  $pass=$row['password'];
  $dept = $row['Department'];
 }
?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Innovative Project | Details &#183; SRECFIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
       <!-- <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href=".s./css/bootstrap-editable.css"> -->
        <link rel="stylesheet" href="../css/normalize.min.css">
        <link rel="stylesheet" href="../css/animate.min.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container-fluid">
            <div class="row">
                    <div class="col-sm-2 text-center">
                    <input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>
                    <br>
                    <input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/>
                    </div>
                    <div class="col-sm-7 text-center">
                        <h3>Innovative Project Details</h3>
                    </div>
                    <div class="col-sm-3">
                    &nbsp;&nbsp;
                    <a class="btn btn-success" href="excel_innovative.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                    </div>
                </div>
                <p>&nbsp;</p>
                <table class="table table-striped table-bordered" id="myTable">
                    <thead class="table-success">
                        <tr>
                        <th>Staff Id</th>
                        <th>Staff name</th>
                        <th>Project Title</th>
                        <th>Description of the Project</th>
                        <th>Status</th>
                        </tr>
                    </thead>
                    <?php 
                       require('../models/dbcon.php');
                       $sql = mysqli_query($conn,"select a.Department,i.staff_id,i.staff_name,i.project_title,i.description,i.status from staff_academics a,staff_innovative i where i.staff_id=a.staff_id and a.Department='".$dept."'");
                       while($row = mysqli_fetch_array($sql))
                       {
                        $staff_id = $row['staff_id'];
                        $staff_name = $row['staff_name'];
                        $patent = $row['project_title'];
                        $institution = $row['description'];
                        $generation = $row['status'];
                     ?>
                        <tbody>
                        <td><?php echo $staff_id; ?></td>
                        <td><?php echo $staff_name; ?></td>
                        <td><?php echo $patent; ?></td>
                        <td><?php echo $institution; ?></td>
                        <td><?php echo $generation; ?></td>
                        </tbody>
                        <?php
                       }?>
                    </table>
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
            
