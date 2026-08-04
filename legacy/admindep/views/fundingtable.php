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
<title>Funding Report</title>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
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
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id="page">
<div id="header">
</div>
<div class="container">
	<!--<center><?php //include('navbar.php');?></center><hr>-->
  <!--<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Interaction Report</marquee></b></div><hr>-->
    <form method="post" action="../controllers/fetch_funding.php">
     <center><h3 style="color: #682D87;">Funding Details</h3></center>
      <hr>
      <div class="form-container offset-sm-4"><br>
        <div class="form-group">
          <label style="color: white;">Staff ID</label>
          <div class="form-inline w3-animate-left">
          <input type="number" name="id" class="form-control col-sm-4" name="staffid">&nbsp;&nbsp;&nbsp;&nbsp;
          <input type="submit" class="btn btn-info w3-hover-yellow" style="cursor:pointer;" name="Getid" value="Staff Report">
        </div></div>
        <div class="form-group has-error w3-animate-right">
          <label style="color: white;">Department</label>
          <div class="form-inline">
            <input type="text" class="form-control col-sm-4" name="dept" value="<?php echo $dept; ?>"  style='background-color:white; font-weight:bold;' readonly>&nbsp;&nbsp;&nbsp;&nbsp;
          <!-- <select name="dept" class="form-control col-sm-6">
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
           </select>&nbsp;&nbsp;&nbsp;&nbsp; -->
           <input type="submit" class="btn btn-info w3-hover-red" style="cursor:pointer;" name="GetDept" value="Department Report"></div></div><br>
           <div class="form-group">
           <label style="color: white;">Report Type</label>
           <div class="form-inline w3-animate-right">
           <select name="rtype" id="rtype" class="form-control col-sm-6">
           <option value="#">-----------</option>
           <option value="dpr" name="GetDPR">Department Period Report</option>
           <option value="dtr" name="GetCol">Department Status Period Report</option>
           <select></div></div>
           <div class="form-group status" id="status">
            <label style="color: white;">Status</label>
            <div class="form-inline w3-animate-left">
           <select name="status" class="form-control col-sm-6">
           <option value="#">-----------</option>
            <option>applied</option>
           <option>received</option>
         </select></div></div>
         <div class="from" id="from">
           <label style="color: white;">From Date</label>
           <div class="form-inline w3-animate-right">
           <input type="date" class="form-control col-sm-4"  name="from"></div></div>
           <div class="form-group w3-animate-left to" id="to">
           <label style="color: white;">To Date</label>
           <input type="date" class="form-control col-sm-4"  name="to"></div><br>
           <a class="fa fa-refresh w3-xlarge w3-spin" href="fundingtable.php"></a>
           &nbsp;&nbsp;&nbsp;&nbsp;
        <a href="../views/home.php"><input type="button" class="btn btn-danger offset-sm-0 w3-animate-zoom" style="cursor:pointer;" value="BACK"></a>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <input type="submit" class="btn btn-success offset-sm-0 w3-animate-zoom w3-hover-orange" style="cursor: pointer;" value="Fetch Report" name="GetReport" target="_blank">
        <!--<input type="submit" class="btn btn-success w3-animate-bottom w3-hover-orange" style="cursor:pointer;" name="GetDPR" value="Department Periodic Report">&nbsp;&nbsp;
        <input type="submit" class="btn btn-success w3-animate-top w3-hover-orange" style="cursor:pointer;" name="GetStat" value="Department Status Periodic Report">
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -->
</div>
    </div><br>
      <br><hr>
</form>
</div>
</div>
</body>
<script>
  $('#rtype').change(function(){
    if($(this).val()=='dpr'){
    $('#status').hide();
    $('.status').hide();
    $('#from').show();
    $('#to').show();
    }else if($(this).val()=='dtr'){
      $('#status').show();
      $('.status').show();
      $('#from').show();
      $('#to').show();
    }else if($(this).val()=='#'){
      $('#status').show();
      $('.status').show();
      $('#from').show();
      $('#to').show();
    }
  });
  </script>
</html>
