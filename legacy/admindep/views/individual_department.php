<?php
session_start();
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
<html>
<head>
	<title>Consolidated Department Report</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
	 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<style>
body{
background:url(2.jpg);
background-repeat:no-repeat;
background-size:100% 100%;
height:800px;
background-attachment:fixed;
}
</style>
</head>
<body bgcolor="tan"><br>
<center><b><font style="color: #176281;" size="6">SREC FIS</font></b></center><br>
<div id="page">
<div id="header">
</div>
<div class="container">
	<!--<center><?php //include('navbar.php');?></center><hr>-->
  <!--<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Interaction Report</marquee></b></div><hr>-->
    <form method="post" action="../controllers/fetch_department.php">
     <center><h3 style="color: #682D87;">Consolidated Department Report</h3></center>
      <hr>
      <div class="form-container offset-sm-4">
        <div class="form-group">
          <label style="color: white;">Department</label>
          <div class="form-inline w3-animate-left">
            <input type="text" class="form-control col-sm-4" name="dept" value="<?php echo $dept; ?>"  style='background-color:white; font-weight:bold;' readonly>&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="submit" class="btn btn-info w3-hover-red" style="cursor:pointer;" name="submit1" value="Department Report">
          </div>
        </div>
    <!-- <div class="form-group">
       <label>Department</label>
       <div class="form-inline">
       <select name="dept" class="form-control col-sm-6">
           <option value="#"></option>
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
        </select><input type="submit" name="GetDept" class="btn btn-outline-info offset-sm-1" style="cursor:pointer;" value="Get"></div></div>-->
        <div class="form-group">
       <label style="color: white;">From Date</label>
       <div class="form-inline w3-animate-right">
       <input type="date" class="form-control col-sm-4"  name="from"></div></div>
       <div class="form-group">
       <label style="color: white;">To Date</label>
       <input type="date" class="form-control col-sm-4 w3-animate-left"  name="to"></div><br>
       <a href="../views/home.php"><input type="button" class="btn btn-danger w3-animate-bottom w3-hover-orange" style="cursor:pointer;" value="BACK"></a>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <input type="submit" class="btn btn-warning w3-animate-bottom w3-hover-black" style="cursor:pointer;" name="GetAll" value="Department Periodic Report">&nbsp;&nbsp;
      </div>
    </div><br>
      <br><hr>
</form>
</div>
</div>
</body>
</html>
