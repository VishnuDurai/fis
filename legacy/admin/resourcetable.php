<?php
session_start();
require ('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Table Interaction</title>
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
    <form method="post" action="fetch_resource.php">
     <center><h3 style="color: #682D87;">Resource Person Details</h3></center>
      <hr>
      <div class="form-container offset-sm-4">
        <div class="form-group">
          <label style="color: white;">Department</label>
          <div class="form-inline">
          <select name="dept" class="form-control col-sm-6">
              <option value="#">----------</option>
              <option>Computer Science And Engineering</option>
              <option>English</option>
              <option>Mathematics</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Civil Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Aeronautical Engineering</option>
              <option>Electrical And Electronics Engineering</option>
              <option>Electronics And Instrumentation Engineering</option>
              <option>Biomedical Engineering</option>
              <option>Electronics And Communication Engineering</option>
              <option>Information Technology</option>
              <option>Master Of Business Administration</option>
              <option>Nano Science And Technology</option>
           </select><input type="submit" name="GetDept" style="cursor:pointer;" class="btn btn-info offset-sm-1" value="Department Report"></div></div>
           <div class="form-group">
             <label style="color: white;">Type</label>
             <div class="form-inline">
           <select name="type" class="form-control col-sm-6">
            <option value="#">-----------</option>
             <option>FDP</option>
            <option>SEMINAR</option>
            <option>WORKSHOP</option>
            <option>PEER ENABLEMENT PROGRAM</option>
            <option>CONFERENCE</option>
            <option>GUEST LECTURE</option>
            <option>OTHER</option>
          </select></div></div>
          <div class="form-group">
         <label style="color: white;">From Date</label>
         <div class="form-inline">
         <input type="date" class="form-control col-sm-4"  name="from"><input type="submit" name="GetDate" class="btn btn-info offset-sm-1" style="cursor:pointer;" value="Periodic Type Report"></div></div>
         <div class="form-group">
         <label style="color: white;">To Date</label>
         <input type="date" class="form-control col-sm-4"  name="to"></div><br>
         <a href="staff.php"><input type="button" class="btn btn-danger" style="cursor:pointer;" value="BACK"></a>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input type="submit" class="btn btn-success" style="cursor:pointer;" name="submit" value="Periodic Department Type Report ">&nbsp;&nbsp;
        <input type="submit" class="btn btn-success" style="cursor:pointer;" name="GetDPR" value="Department Periodic Report">&nbsp;&nbsp;
        <input type="submit" class="btn btn-warning" style="cursor:pointer;" name="submit1" value="Institution Report">
</div>
    </div><br>
      <br><hr>
</form>
</div>
</div>
</body>

</html>
