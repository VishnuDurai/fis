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
        <title>Aadhar | Details &#183; SRECFIS</title>
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
                    &nbsp;&nbsp;
                    <a class="btn btn-success" href="excel_interaction.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                    </div>
                    <div class="col-sm-7 text-center">
                        <h3>Aadhar Details</h3>
                    </div>
                    <div class="col-sm-3">
                    </div>
                </div>
                <p>&nbsp;</p>
                <table class="table table-striped table-bordered">
                    <thead class="table-success">
                        <tr>
                        <th>Staff Id</th>
                        <th>Staff Name</th>
                        <th>Designation</th>
                        <th>View Pan</th>
                        </tr>
                    </thead>
                    <?php 
                       require('../models/dbcon.php');
                       $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.staff_name,i.path1 from staff_academics a,staff_aadhar i where i.staff_id=a.staff_id and a.Department='".$dept."'");
                       while($row = mysqli_fetch_array($sql))
                       {
                        $sid = $row['staff_id'];
                        $name = $row['staff_name'];
                        $des = $row['Designation'];
                        $fil = $row['path1'];
                        ?>
                        <tbody>
                        <td><?php echo $sid?></td>
                        <td><?php echo $name?></td>
                        <td><?php echo $des?></td>
                        <td><a href="../../admin/document/<?php echo $row['path1']; ?>"> View </a></button></td>
                        </tbody>
                        <?php
                       }?>
                    </table>
            </div>
            </body>
            </html>
            
