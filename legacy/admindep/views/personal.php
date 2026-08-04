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
        <title>Faculty | Details &#183; SRECFIS</title>
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
                        <h3>Faculty Details</h3>
                    </div>
                    <div class="col-sm-3">
                    &nbsp;&nbsp;
                    <a class="btn btn-success" href="excel_personal.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                    </div>
                </div>
                <p>&nbsp;</p>
                <table class="table table-striped table-bordered" id="myTable">
                    <thead class="table-success">
                        <tr>
                        <th>Staff Id</th>
                        <th>Staff Name</th>
                        <th>Department</th>
                        <th>DOB</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>Mobile</th>
                        <th>Email</th>
                        <th>Pan No</th>
                        <th>Aadhar No</th>
                        <th>Type of Faculty</th>
                        </tr>
                    </thead>
                    <?php 
                       require('../models/dbcon.php');
                       $sql = mysqli_query($conn,"select a.Department,i.staff_id,i.staff_name,i.dob,i.gender,i.address,i.mobile,i.email,i.pan,i.aadhar,i.type from staff_academics a,staff_personal i where i.staff_id=a.staff_id and a.Department='".$dept."'");
                       while($row = mysqli_fetch_array($sql))
                       {
                        $sid = $row['staff_id'];
                        $name = $row['staff_name'];
                        $dob = $row['dob'];
                        $gen = $row['gender'];
                        $add = $row['address'];
                        $mob = $row['mobile'];
                        $email = $row['email'];
                        $pan = $row['pan'];
                        $aad = $row['aadhar'];
                        $typ = $row['type'];
                        ?>
                        <tbody>
                        <td><?php echo $sid?></td>
                        <td><?php echo $name?></td>
                        <td><?php echo $dept?></td>
                        <td><?php echo $dob?></td>
                        <td><?php echo $gen?></td>
                        <td><?php echo $add?></td>
                        <td><?php echo $mob?></td>
                        <td><?php echo $email?></td>
                        <td><?php echo $pan?></td>
                        <td><?php echo $aad?></td>
                        <td><?php echo $typ?></td>
                        </tbody>
                        <?php
                       }?>
                    </table>
            </div>
            
        <!-- <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/animatedModal.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_personal(){
                $.ajax({
                    url:'../controllers/fetch_personal.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                            var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                            html_data +='<td>'+data[c].staff_name+'</td>';
                            //html_data += '<td data-name="Department" class="Department" data-type="text" data-pk="'+data[c].id+'">'+data[c].Department+'</td>';
                            //html_data += '<td data-name="dob" class="dob" data-type="date" data-pk="'+data[c].id+'">'+data[c].dob'</td>;
                            //html_data += '<td data-name="gender" class="gender" data-type="text" data-pk="'+data[c].id'">'+data[c].gender'</td>;
                            //html_data += '<td data-name="address" class="address" data-type="text" data-pk="'+data[c].id'">'+data[c].address'</td>;
                            //html_data += '<td data-name="mobile" class="mobile" data-type="text" '
                 
                            $('#personal_data').append(html_data);
                        }
                    }
                })
            };
            fetch_personal();
        </script> -->
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