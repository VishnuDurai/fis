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
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.min.js"></script>
<script src="./jquery.js" type="text/JavaScript" language="javascript"></script>
      <script src="./jquery.PrintArea.js" type="text/JavaScript" language="javascript"></script>
</head>
<body bgcolor="tan">
  <center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
  <div id="page">
  <div id="header">
  </div>
  <center><h3 style="color: #682D87;">Research Scholar Details</h3></center>
     <hr>
     <div class="form-inline">
<a href="scholartable.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-danger btn-sm"> Back </button></a>
<div class="wrapper">
<a href="javascript:void(0);" id="print_button2"><button class="btn btn-outline-primary btn-sm" style="cursor:pointer;">Download and Print</button></a>
<input type="text" class="form-control col-sm-1" ng-model="text" placeholder="Header1">
<input type="text" class="form-control col-sm-1" ng-model="text1" placeholder="Header2">
<input type="text" class="form-control col-sm-1" ng-model="text2" placeholder="Header3">
<input type="text" class="form-control col-sm-1" ng-model="ftext" placeholder="Footer1">
<input type="text" class="form-control col-sm-1" ng-model="ftext1" placeholder="Footer2">
<input type="text" class="form-control col-sm-1" ng-model="ftext2" placeholder="Footer3">
     </div>
     </div>
     <br>
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
         $sql = mysql_query("select distinct a.Department from staff_academics a,staff_scholars i where a.staff_id = i.staff_id and a.Department='".$_POST['dept']."'");
         while($row = mysql_fetch_array($sql)) {
           $dep = $row['Department'];
           $id = $row['staff_id'];?>
           <b><label class="offset-sm-1">Department of</label>&nbsp;<?php echo $dep;?></b>
           <?php
           }
           ?>
           <?php
           $sql = mysql_query("select distinct a.Department,i.staff_id from staff_academics a,staff_scholars i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."'");
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
                 <b><span><label>Research Scholars Report</label></span></b>
               </div>
               <div class="col">
                 <b><label>Date: </label></b><?php $date = date('d-m-y'); echo $date;  ?>
               </div>
             </div>
<table class="table table-sm table-bordered">
         <thead class="table-sm table-success">
           <tr>
             <th style="width:30px;">SNO</th>
             <th style="width:100px; text-align:center;">Staff Name</th>
            <th style="width:100px; text-align:center;">Designation</th>
            <th style="width:100px; text-align:center;">Department</th>
            <th style="width:100px; text-align:center;">Scholar Id</th>
             <th style="width:100px; text-align:center;">University</th>
             <th style="width:100px; text-align:center;">Supervisor Name</th>
             <th style="width:100px; text-align:center;">Designation</th>
             <th style="width:100px; text-align:center;">Organisation</th>
             <th style="width:100px; text-align:center;">Status</th>
             </tr>
        </thead>
        <?php
        require ('DB/dbcon.php');
        if(isset($_POST['Getid'])){
        $sql = mysql_query("select a.Department,a.Designation,i.staff_id,i.staff_name,i.university,i.sup_name,i.res_id,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_name'];
          $des = $row['Designation'];
          $dep = $row['Department'];
          $sup = $row['res_id'];
          $type = $row['university'];
          $title = $row['sup_name'];
          $from = $row['desgination'];
          $to = $row['organisation'];
          $org = $row['status'];
          ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        </tbody>
         <?php
          $s++;
              }
      }if(isset($_POST['Getsupid'])){
        $sql = mysql_query("select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and i.res_id='".$_POST['supid']."'");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_name'];
          $des = $row['Designation'];
          $dep = $row['Department'];
          $sup = $row['res_id'];
          $type = $row['university'];
          $title = $row['sup_name'];
          $from = $row['desgination'];
          $to = $row['organisation'];
          $org = $row['status'];
        ?>
        <tbody>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        </tbody>
         <?php
          $s++;
              }
      }if(isset($_POST['GetDept'])){
        $sql = mysql_query("select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and a.Department='".$_POST['dept']."' order by a.Designation desc");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_name'];
          $des = $row['Designation'];
          $dep = $row['Department'];
          $sup = $row['res_id'];
          $type = $row['university'];
          $title = $row['sup_name'];
          $from = $row['desgination'];
          $to = $row['organisation'];
          $org = $row['status'];
        ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        </tbody>
         <?php
          $s++;
              }
      }if(isset($_POST['submit'])){
        $sql = mysql_query("select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id order by a.Designation desc");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_name'];
          $des = $row['Designation'];
          $dep = $row['Department'];
          $sup = $row['res_id'];
          $type = $row['university'];
          $title = $row['sup_name'];
          $from = $row['desgination'];
          $to = $row['organisation'];
          $org = $row['status'];
        ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        </tbody>
         <?php
          $s++;
              }
      }
      if(isset($_POST['GetDPR'])){
        $sql = mysql_query("select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and a.Department='".$_POST['dept']."' and i.status='".$_POST['status']."' order by a.Designation desc");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_name'];
          $des = $row['Designation'];
          $dep = $row['Department'];
          $sup = $row['res_id'];
          $type = $row['university'];
          $title = $row['sup_name'];
          $from = $row['desgination'];
          $to = $row['organisation'];
          $org = $row['status'];
        ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        </tbody>
         <?php
          $s++;
              }
      }
      if(isset($_POST['GetStatus'])){
        $sql = mysql_query("select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and i.status='".$_POST['status']."' order by a.Designation desc");
        $s =1;
        while($row = mysql_fetch_array($sql)){
          $name = $row['staff_name'];
          $des = $row['Designation'];
          $dep = $row['Department'];
          $sup = $row['res_id'];
          $type = $row['university'];
          $title = $row['sup_name'];
          $from = $row['desgination'];
          $to = $row['organisation'];
          $org = $row['status'];
        ?>
        <tbody>
          <td><?php echo $s;?></td>
          <td style="width:200px; text-align:center;"><?php echo $name;?></td>
          <td style="width:200px; text-align:center;"><?php echo $des;?></td>
          <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
          <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
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
        <b>{{ftext1}}</b>
        </div>
        <div class="col" style="text-align: right;">
        <b>{{ftext2}}</b>
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
