<?php
session_start();
require ('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html ng-app>
<head>
  <title>Personal</title>

  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.min.js"></script>
<script src="./jquery.js" type="text/JavaScript" language="javascript"></script>
      <script src="./jquery.PrintArea.js" type="text/JavaScript" language="javascript"></script>
<style type="text/css" media="print">
@page{
  size:auto;
  margin:0;
}
</style>
</head>
<body bgcolor="tan">
  <center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
  <div id="page">
  <div id="header">
  </div>
  <center><h3 style="color: #682D87;">Personal Details</h3></center>
     <hr>
     <div class="form-inline">
<a href="personaltable.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-danger btn-sm"> Back </button></a>
<div class="wrapper">
<a href="javascript:void(0);" id="print_button2"><button class="btn btn-outline-primary btn-sm" style="cursor:pointer;">Download and Print</button></a>
<input type="text" class="form-control col-sm-1 " ng-model="text" placeholder="Header1">
<input type="text" class="form-control col-sm-1 " ng-model="text1" placeholder="Header2">
<input type="text" class="form-control col-sm-1 " ng-model="text2" placeholder="Header3">
<input type="text" class="form-control col-sm-1 " ng-model="ftext" placeholder="Footer1">
<input type="text" class="form-control col-sm-1 " ng-model="ftext1" placeholder="Footer2">
<input type="text" class="form-control col-sm-1 " ng-model="ftext2" placeholder="Footer3">
      </div>
     </div>
     <div class="content">
  <div class="row">
    <div class="col">
      <b>{{text}}</b>
    </div>
    <div class="col">
    <b>  {{text1}}</b>
    </div>
    <div class="col-1">
    <b>  {{text2}}</b>
    </div>
  </div>
<?php include('header.php');?><center>
<?php
$sql = mysql_query("select distinct a.Department from staff_academics a,staff_personal i where a.staff_id = i.staff_id and a.Department='".$_POST['dept']."'");
while($row = mysql_fetch_array($sql)) {
  $dep = $row['Department'];
  $id = $row['staff_id'];?>
  <b><label class="offset-sm-1">Department of</label>&nbsp;<?php echo $dep;?></b>
  <?php
  }
  ?>
<?php
$sql = mysql_query("select distinct a.Department,i.staff_id from staff_academics a,staff_personal i where a.staff_id = i.staff_id and i.staff_id='".$_POST['id']."'");
while($row = mysql_fetch_array($sql)) {
  $dep = $row['Department'];
  $id = $row['staff_id'];?>
  <b><label class="offset-sm-1">Department of</label>&nbsp;<?php echo $dep;?></b>
  <?php
  }
  ?>
<br><div class="row">
  <div class="col">

  </div>
  <div class="col">
    <b><span><label>Personal Details</label></span></b>
  </div>
  <div class="col">
    <b><label>Date: </label></b><?php $date = date('d-m-y'); echo $date;  ?>
  </div>
</div>
<table class="table table-sm table-bordered">
         <thead class="table-sm table-success">
           <tr>
             <th style="width:30px;">SNO</th>
             <th style="width:100px; text-align:center;">Staff id</th>
             <th style="width:100px; text-align:center;">Staff name</th>
             <th style="width:100px; text-align:center;">Date of birth</th>
             <th style="width:100px; text-align:center;">Gender</th>
             <th style="width:300px; text-align:center;">Address</th>
             <th style="width:100px; text-align:center;">Mobile</th>
             <th style="width:100px; text-align:center;">Email</th>
             <th style="width:100px; text-align:center;">Pan</th>
             <th style="width:100px; text-align:center;">Aadhar</th>
           </tr>
        </thead>
        <?php
        require ('DB/dbcon.php');
        if(isset($_POST['submit'])){
$sql = mysql_query("select * from staff_personal");
  $s =1;
  while($row = mysql_fetch_array($sql)){
    $name = $row['staff_id'];
    $des = $row['staff_name'];
    $dep = $row['dob'];
    $type = $row['gender'];
    $title = $row['address'];
    $from = $row['mobile'];
    $to = $row['email'];
    $org = $row['pan'];
    $ard = $row['aadhar'];
  ?>
  <tbody>
    <td><?php echo $s;?></td>
    <td style="width:200px; text-align:center;"><?php echo $name;?></td>
    <td style="width:200px; text-align:center;"><?php echo $des;?></td>
    <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
    <td style="width:200px; text-align:center;"><?php echo $type;?></td>
    <td style="width:200px; text-align:center;"><?php echo $title;?></td>
    <td style="width:200px; text-align:center;"><?php echo $from;?></td>
    <td style="width:200px; text-align:center;"><?php echo $to;?></td>
    <td style="width:200px; text-align:center;"><?php echo $org;?></td>
    <td style="width:200px; text-align:center;"><?php echo $ard;?></td>
  </tbody>
   <?php
    $s++;
        }
      }if(isset($_POST['submit1'])&&isset($_POST['id'])){
        $sql = mysql_query("select * from staff_personal where staff_id='".$_POST['id']."'");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_id'];
          $des = $row['staff_name'];
          $dep = $row['dob'];
          $type = $row['gender'];
          $title = $row['address'];
          $from = $row['mobile'];
          $to = $row['email'];
          $org = $row['pan'];
          $ard = $row['aadhar'];
        ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
          <td style="width:200px; text-align:center;"><?php echo $ard;?></td>
        </tbody>
         <?php
          $s++;
              }
      }if(isset($_POST['GetDept'])){
        $dep = $_POST['dept'];
        $sql = mysql_query("select a.Department,i.staff_id,i.staff_name,i.dob,i.gender,i.address,i.mobile,i.email,i.pan,i.aadhar from staff_academics a,staff_personal i where a.staff_id = i.staff_id and a.Department='$dep'");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_id'];
          $des = $row['staff_name'];
          $dep = $row['dob'];
          $type = $row['gender'];
          $title = $row['address'];
          $from = $row['mobile'];
          $to = $row['email'];
          $org = $row['pan'];
          $ard = $row['aadhar'];
        ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
          <td style="width:200px; text-align:center;"><?php echo $ard;?></td>
        </tbody>
         <?php
          $s++;
              }
      }
        ?>
      </table></center><br><br><br>
      <table>
        <div class="row">
          <div class="col" style="text-align: left;">
            <b>{{ftext}}</b>
          </div>
          <div class="col" style="text-align: center;">
          <b>  {{ftext1}}</b>
          </div>
          <div class="col" style="text-align: right;">
          <b>  {{ftext2}}</b>
          </div>
        </div>
   </table>
    </div>

<script>
    $(document).ready(function(){
        $("#print_button1").click(function(){
            var mode = 'iframe'; // popup
            var close = mode == "popup";
            var options = { mode : mode, popClose : close};
            $("div.wrapper").printArea( options );
        });
         $("#print_button2").click(function(){
            var mode = 'iframe'; // popup
            var close = mode == "popup";
            var options = { mode : mode, popClose : close};
            $("div.content").printArea( options );
        });
    });

  </script>
</body>
</html>
