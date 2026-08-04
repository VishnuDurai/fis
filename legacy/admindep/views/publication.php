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
        <title>Publication | Details &#183; SREC FIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
       <!-- <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css"> -->
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
                    <h3>Publication Details</h3>
                </div>
                <div class="col-sm-3">
                &nbsp;&nbsp;
   <a class="btn btn-success" href="excel_publication.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered" id="myTable">
                <thead class="table-success">
                    <tr>
                    <th>Staff Id</th>
                    <th>Staff Name</th>
                    <th>Type of Publication</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Name of Journal/Conference</th>
                    <th>Date of conference</th>
                    <th>Organizer(conference)</th>
                    <th>DOI</th>
                    <th>ISSN/ISBN</th>
                    <th>Month</th>
                    <th>Volume</th>
                    <th>PP</th>
                    <th>Scopus Indexed</th>
                    <th>Citations</th>
                    <th>H-index</th>
                    <th>Impact Factor</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <?php 
                require('../models/dbcon.php');
                $sql = mysqli_query($conn,"select a.Department,a.Designation,i.id,i.file,i.staff_id,i.staff_name,i.type_pub,i.type,i.title,i.journel,i.date_con,i.organizer,i.doi,i.isbn,i.month_pub,i.volume_pub,i.pp,i.index_pub,i.citations,i.hindex,i.impact from staff_academics a,staff_publication i where i.staff_id=a.staff_id and a.Department='".$dept."'");
                while($row = mysqli_fetch_array($sql)){
                    $sid = $row['staff_id'];
                    $sname = $row['staff_name'];
                    $type_pub = $row['type_pub'];
                    $type = $row['type'];
                    $title = $row['title'];
                    $journel = $row['journel'];
                    $date_con = $row['date_con'];
                    $organizer = $row['organizer'];
                    $doi = $row['doi'];
                    $isbn = $row['isbn'];
                    $month_pub = $row['month_pub'];
                    $volume_pub = $row['volume_pub'];
                    $pp = $row['pp'];
                    $index_pub = $row['index_pub'];
                    $citations = $row['citations'];
                    $hindex = $row['hindex'];
                    $impact = $row['impact'];
                    $file = $row['file'];
                     ?>
                        <tbody>
                        <tr>
                        <td><?php echo $sid;?></td>
                        <td><?php echo $sname;?></td>
                        <td><?php echo $type_pub; ?></td>
                        <td><?php echo $type; ?></td>
                        <td><?php echo $title;?></td>
                        <td><?php echo $journel;?></td>
                        <td><?php echo $date_con;?></td>
                        <td><?php echo $organizer;?></td>
                        <td><?php echo $doi; ?></td>
                        <td><?php echo $isbn; ?></td>
                        <td><?php echo $month_pub; ?></td>
                        <td><?php echo $volume_pub; ?></td>
                        <td><?php echo $pp; ?></td>
                        <td><?php echo $index_pub; ?></td>
                        <td><?php echo $citations; ?></td>
                        <td><?php echo $hindex; ?></td>
                        <td><?php echo $impact; ?></td>
                        <td><a href="../../admin/document/<?php echo $row['file']; ?>"> View </a></button></td>
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