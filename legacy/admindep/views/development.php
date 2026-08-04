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
        <title>Research and Development | Details &#183; SRECFIS</title>
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
                    </div>
                    <div class="col-sm-7 text-center">
                        <h3>Research and Development Details</h3>
                    </div>
                    <div class="col-sm-3">
                    </div>
                </div>
                <p>&nbsp;</p>
                <table class="table table-striped table-bordered">
                    <thead class="table-success">
                        <tr>
                        <th>Staff ID</th>
                        <th>Staff name</th>
                        <th>Type</th>
                        <th>Priniciple investigator/Faculty name</th>
                        <th>Priniciple inestigator/Faculty ID</th>
                        <th>Co-investigator/Faculty name</th>
                        <th>Co-inestigator/Faculty ID</th>
                        <th>Title</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Academics year</th>
                        <th>Status</th>
                        <th>Institution</th>
                        <th>Revenue</th>
                        </tr>
                    </thead>
                    <?php 
                       require('../models/dbcon.php');
                       $sql = mysqli_query($conn,"select a.Department,i.staff_id,i.staff_name,i.type,i.coname,i.coid,i.title,i.from_date,i.to_date,i.year_aca,i.status,i.institution,i.revenue from staff_academics a,staff_development i where i.staff_id=a.staff_id and a.Department='".$dept."'");
                       while($row = mysqli_fetch_array($sql))
                       {
                        $type = $row['type'];
                        $staff_name = $row['staff_name'];
                        $staff_id = $row['staff_id'];
                        $coname = $row['coname'];
                        $coid = $row['coid'];
                        $title = $row['title'];
                        $from_date = $row['from_date'];
                        $to_date = $row['to_date'];
                        $year_aca = $row['year_aca'];
                        $status = $row['status'];
                        $institution = $row['institution'];
                        $revenue = $row['revenue'];
                        ?>
                        <tbody>
                        <td><?php echo $row['staff_id']?></td>
                        <td><?php echo $row['staff_name']?></td>
                        <td><?php echo $row['type']?></td>
                        <td><?php echo $row['coname']?></td>
                        <td><?php echo $row['coid']?></td>
                        <td><?php echo $row['title']?></td>
                        <td><?php echo $row['from_date']?></td>
                        <td><?php echo $row['to_date']?></td>
                        <td><?php echo $row['year_aca']?></td>
                        <td><?php echo $row['status']?></td>
                        <td><?php echo $row['institution']?></td>
                        <td><?php echo $row['revenue']?></td>                        
                        <td><a href="../admin/document/<?php echo $row['path1']; ?>"> View </a></td>
                        </tbody>
                        <?php
                       }?>
                    </table>
            </div>
            </body>
            </html>
            
