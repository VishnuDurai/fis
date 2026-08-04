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
$row = mysqli_fetch_array($result);

if(mysqli_num_rows($result)<1)
{
  $result = null;
}


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
	<title>Table Interaction</title>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
  <script src="../js/jquery.min.js"></script>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
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
    <form method="post" action="../controllers/fetch_interaction.php">
     <center><h3 style="color: #682D87;">Interaction Details</h3></center>
      <hr>
      <div class="form-container offset-sm-4">
     <div class="form-group has-error w3-animate-left">
       <label style="color: white;">Department</label>
       <div class="form-inline">
         <input type="text" id="deptt" class="form-control col-sm-4" name="dept" value="<?php echo $dept; ?>" style='background-color:white; font-weight:bold;' readonly>&nbsp;&nbsp;&nbsp;&nbsp;

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
        </select> -->
        <input type="submit" id="gdept" name="GetDept" class="btn btn-info offset-sm-1" style="cursor:pointer;" value="Department Report"></div></div>
        <div class="form-group w3-animate-right">
        <label style="color: white;">Report Type</label>
        <div class="form-inline">
        <select name="rtype" id="rtype" class="form-control col-sm-6">
        <option value="#">-----------</option>
        <option name="GetCol" value="dtr">Periodic Department Type Report</option>
        <option name="GetDPR" value="dpr">Department Periodic Report</option>
        </select></div></div>
          <div class="form-group type w3-animate-left">
            <label style="color: white;">Type</label>
            <div class="form-inline">
          <select name="type" class="form-control col-sm-6" id="type">
           <option value="#">-----------</option>
            <option>FDP</option>
           <option>SEMINAR</option>
           <option>WORKSHOP</option>
           <option>INDUSTRY INTERACTION</option>
           <option>PEP</option>
           <option>GUEST LECTURE</option>
           <option>SHORT TERM COURSE</option>
           <option>GIAN COURSE</option>
           <option>EXTERNAL EXAMINER</option>
           <option>TOURNAMENT</option>
           <option>OTHER</option>
         </select></div></div>
          <div class="form-group from w3-animate-right">
         <label style="color: white;">From Date</label>
         <div class="form-inline">
         <input type="date" class="form-control col-sm-4"  name="from" id="from"></div></div>
         <div class="form-group to w3-animate-left">
         <label style="color: white;">To Date</label>
         <div class="form-inline">
         <input type="date" class="form-control col-sm-4"  name="to" id="to"></div></div>
         <a class="fa fa-refresh w3-xlarge w3-spin" href="interactiontable.php"></a>
         &nbsp;&nbsp;&nbsp;&nbsp;
         <a href="../views/home.php"><input type="button" class="btn btn-danger w3-animate-bottom" style="cursor:pointer;" value="BACK"></a>
         &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         <!--<input type="submit" class="btn btn-success" style="cursor:pointer;" name="GetCol" value="Periodic Department Type Report">&nbsp;&nbsp;
        <input type="submit" class="btn btn-success" style="cursor:pointer;" name="GetDPR" value="Department Periodic Report">&nbsp;&nbsp; -->
        <input type="submit" class="btn btn-success w3-animate-bottom w3-hover-orange" name="GetReport" value="Fetch Report" target="_blank">
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
    $('#from').show();
    $('#to').show();
    $('#type').hide();
    $('.from').show();
    $('.to').show();
    $('.type').hide();
    $('#deptt').show();
    $('#gdept').show();
  }else if($(this).val()=='dtr'){
    $('#from').show();
    $('#to').show();
    $('#type').show();
    $('.from').show();
    $('.to').show();
    $('.type').show();
    $('#deptt').show();
    $('#gdept').show();
  }
});
</script>
</html>