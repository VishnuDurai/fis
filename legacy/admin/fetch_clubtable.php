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
  <center><h3 style="color: #682D87;">Club Activity</h3></center>
     <hr>
     <div class="form-inline">
<a href="clubtable.php"><button type="button" style=" cursor: pointer;" class="btn btn-outline-danger btn-sm"> Back </button></a>
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
         $sql = mysql_query("select distinct a.Department from staff_academics a,staff_event_organized i where a.staff_id = i.staff_id and a.Department='".$_POST['dept']."'");
         while($row = mysql_fetch_array($sql))  {
         $dep = $row['Department'];?>
         <b><label class="offset-sm-1">Department of</label>&nbsp;<?php echo $dep;?></b>
         <?php
         }
         ?><br><div class="row">
           <div class="col">

           </div>
           <div class="col">
             <b><span><label>Club Activities</label></span></b>
           </div>
           <div class="col">
             <b><label>Date: </label></b><?php $date = date('d-m-y'); echo $date;  ?>
           </div>
         </div>
         <?php
         $sql = mysql_query("select distinct type from staff_event_organized where type='".$_POST['typ']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."'");
       while($row = mysql_fetch_array($sql))  {
         $depts = $row['type'];?>
      <b><label class="offset-sm-1"></label>&nbsp;<?php echo $depts;?></b>
        <?php
        }
        ?>
        <table class="table table-sm table-bordered">
                 <thead class="table-sm table-success">
                   <tr>
                     <th style="width:30px;">SNO</th>
                     <th style="width:100px; text-align:center;">Club Name</th>
                     <th style="width:100px; text-align:center;">Staff Name</th>
                     <th style="width:100px; text-align:center;">Designation</th>
                     <th style="width:100px; text-align:center;">Department</th>
                     <th style="width:100px; text-align:center;">Type</th>
                     <th style="width:100px; text-align:center;">Title</th>
                     <th style="width:100px; text-align:center;">From Date</th>
                     <th style="width:100px; text-align:center;">To Date</th>
                     <th style="width:100px; text-align:center;">Resource Person</th>
                     <th style="width:100px; text-align:center;">No Of Beneficiaries</th>
                     <th style="width:100px; text-align:center;">Sponsorship</th>
                     <th style="width:100px; text-align:center;">Grants</th>
                     </tr>
                </thead>
                <?php
                require ('DB/dbcon.php');
              if(isset($_POST['Club'])){
                $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.club,i.type,i.title,i.from_date,i.to_date,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.club='".$_POST['club']."' order by a.Department,a.Designation desc,i.from_date");
                $s =1;
                while($row = mysql_fetch_array($sql)){
                  $staffname=$row['staff_name'];
                  $des = $row['Designation'];
                  $dep = $row['Department'];
                  $club = $row['club'];
                  $type = $row['type'];
                  $title = $row['title'];
                  $from = $row['from_date'];
                  $to = $row['to_date'];
                  $res = $row['res_person'];
                  $ben = $row['ben_person'];
                  $spon = $row['sponsership'];
                  $gra = $row['granted'];
                  ?>
                <tbody>
                  <td><?php echo $s;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                  <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
                </tbody>
                 <?php
                  $s++;
                      }
                    }if(isset($_POST['type'])){
                      $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.type='".$_POST['typ']."' order by a.Department,a.Designation desc,i.from_date");
                      $s =1;
                      while($row = mysql_fetch_array($sql)){
                        $staffname=$row['staff_name'];
                        $des = $row['Designation'];
                        $dep = $row['Department'];
                        $club = $row['club'];
                        $type = $row['type'];
                        $title = $row['title'];
                        $from = $row['from_date'];
                        $to = $row['to_date'];
                        $res = $row['res_person'];
                        $ben = $row['ben_person'];
                        $spon = $row['sponsership'];
                        $gra = $row['granted'];
                        ?>
                      <tbody>
                        <td><?php echo $s;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
                      </tbody>
                       <?php
                        $s++;
                            }
                          }if(isset($_POST['GetDate'])){
                      $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.type='".$_POST['typ']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by a.Department,a.Designation desc,i.from_date");
                      $s =1;
                      while($row = mysql_fetch_array($sql)){
                        $staffname=$row['staff_name'];
                        $des = $row['Designation'];
                        $dep = $row['Department'];
                        $club = $row['club'];
                        $type = $row['type'];
                        $title = $row['title'];
                        $from = $row['from_date'];
                        $to = $row['to_date'];
                        $res = $row['res_person'];
                        $ben = $row['ben_person'];
                        $spon = $row['sponsership'];
                        $gra = $row['granted'];
                        ?>
                      <tbody>
                        <td><?php echo $s;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
                      </tbody>
                       <?php
                        $s++;
                            }
                          }if(isset($_POST['submit'])){
                      $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.club,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.club='".$_POST['club']."' and i.type='".$_POST['typ']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by a.Department,a.Designation desc,i.from_date");
                      $s =1;
                      while($row = mysql_fetch_array($sql)){
                        $staffname=$row['staff_name'];
                        $des = $row['Designation'];
                        $dep = $row['Department'];
                        $club = $row['club'];
                        $type = $row['type'];
                        $title = $row['title'];
                        $from = $row['from_date'];
                        $to = $row['to_date'];
                        $res = $row['res_person'];
                        $ben = $row['ben_person'];
                        $spon = $row['sponsership'];
                        $gra = $row['granted'];
                        ?>
                      <tbody>
                        <td><?php echo $s;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
                      </tbody>
                       <?php
                        $s++;
                            }
                          }if(isset($_POST['submit1'])){
                            $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.club,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id order by a.Department,a.Designation Desc,i.from_date");
                            $s =1;
                            while($row = mysql_fetch_array($sql)){
                              $staffname=$row['staff_name'];
                              $des = $row['Designation'];
                              $dep = $row['Department'];
                              $club = $row['club'];
                              $type = $row['type'];
                              $title = $row['title'];
                              $from = $row['from_date'];
                              $to = $row['to_date'];
                              $res = $row['res_person'];
                              $ben = $row['ben_person'];
                              $spon = $row['sponsership'];
                              $gra = $row['granted'];
                              ?>
                            <tbody>
                              <td><?php echo $s;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                              <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
                            </tbody>
                             <?php
                              $s++;
                                  }
                          }
                          if(isset($_POST['GetDPR'])){
                      $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.club='".$_POST['club']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by a.Department,a.Designation desc,i.from_date");
                      $s =1;
                      while($row = mysql_fetch_array($sql)){
                        $staffname=$row['staff_name'];
                        $des = $row['Designation'];
                        $dep = $row['Department'];
                        $club = $row['club'];
                        $type = $row['type'];
                        $title = $row['title'];
                        $from = $row['from_date'];
                        $to = $row['to_date'];
                        $res = $row['res_person'];
                        $ben = $row['ben_person'];
                        $spon = $row['sponsership'];
                        $gra = $row['granted'];
                        ?>
                      <tbody>
                        <td><?php echo $s;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
                      </tbody>
                       <?php
                        $s++;
                            }
                          }if(isset($_POST['submit'])){
                      $sql = mysql_query("select a.staff_name,a.Department,a.Designation,i.club,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.club='".$_POST['club']."' and i.type='".$_POST['typ']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by a.Department,a.Designation desc,i.from_date");
                      $s =1;
                      while($row = mysql_fetch_array($sql)){
                        $staffname=$row['staff_name'];
                        $des = $row['Designation'];
                        $dep = $row['Department'];
                        $club = $row['club'];
                        $type = $row['type'];
                        $title = $row['title'];
                        $from = $row['from_date'];
                        $to = $row['to_date'];
                        $res = $row['res_person'];
                        $ben = $row['ben_person'];
                        $spon = $row['sponsership'];
                        $gra = $row['granted'];
                        ?>
                      <tbody>
                        <td><?php echo $s;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $club;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $staffname;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $des;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $res;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
                        <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
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
