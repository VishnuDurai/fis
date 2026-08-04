<?php
session_start();
require ('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
$result1 = mysql_query("select * from club");
?>
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
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
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id="page">
<div id="header">
</div>
<div class="container">
	<!--<center><?php //include('navbar.php');?></center><hr>-->
  <!--<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Interaction Report</marquee></b></div><hr>-->
    <form method="post" action="fetch_clubtable.php">
     <center><h3 style="color: purple;">Club Activities</h3></center>
      <hr>
      <div class="form-container offset-sm-4">
        <div class="form-group">
          <label style="color:white">Club Activity</label>
          <div class="form-inline">
          <select name="club" class="form-control col-sm-6">
            <option value="#">--------</option>
              <?php
              while($row1 = mysql_fetch_array($result1)):;
              ?>
              <option><?php
              echo $row1[1];
              ?></option>
              <?php
              endwhile;
              ?>
            </select>
            <input type="submit" name="Club" class="btn btn-info offset-sm-1" style="cursor:pointer;" value="Club Report">
        </div></div>
        <div class="form-group">
            <label style="color:white">Type</label>
            <div class="form-inline">
          <select name="typ" class="form-control col-sm-6">
           <option value="#">-----------</option>
           <option>FDP</option>
           <option>WORKSHOP</option>
           <option>SEMINAR</option>
           <option>CONTEST</option>
           <option>CONFERENCE</option>
           <option>PEP</option>
           <option>TECHNICAL SYMPOSIUM</option>
           <option>OTHER</option>
         </select>
         <input type="submit" name="type" class="btn btn-info offset-sm-1" style="cursor:pointer;" value="Type Report"></div></div>

          <div class="form-group">
         <label style="color:white">From Date</label>
         <div class="form-inline">
         <input type="date" class="form-control col-sm-4"  name="from">
         <input type="submit" name="GetDate" class="btn btn-info offset-sm-1" style="cursor:pointer;" value="Periodic Type Report"></div></div>
         <div class="form-group">
         <label style="color:white">To Date</label>
         <input type="date" class="form-control col-sm-4"  name="to"></div><br>
         <a href="staff.php"><input type="button" class="btn btn-danger" style="cursor:pointer;" value="BACK"></a>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input type="submit" class="btn btn-success" style="cursor:pointer;" name="submit" value="Periodic Club Type Report">&nbsp;&nbsp;
        <input type="submit" class="btn btn-success" style="cursor:pointer;" name="GetDPR" value="Club Periodic Report">&nbsp;&nbsp;
        <input type="submit" class="btn btn-warning" style="cursor:pointer;" name="submit1" value="Institution Report">
</div>
    </div><br>
      <br><hr>
</form>
</div>
</div>
</body>

</html>
