<?php
require('DB/dbcon.php');
session_start();
if(empty($_SESSION['staff_id'])){
  header("location:access-denied.php");
}
$result = mysql_query("SELECT * FROM staff_academics WHERE staff_id = '$_SESSION[staff_id]'")
or die("there is no records to display..\n" . mysql_error());
if(mysql_num_rows($result)<1)
{
  $result = null;
}
$row = mysql_fetch_array($result);
if($row)
{
  $id = $row['staff_id'];
  $name = $row['staff_name'];
  $date = $row['Date_of_joining'];
  $department = $row['Department'];
  $des = $row['Designation'];
  $qua = $row['Qualification'];
}
 ?>
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
<body background="#2c3e50;"><br>
  <center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
  <div id="page">
<center>
  <div class="col-sm-11">
      <div class="container">
         <?php include('navbar.php');?> <br>
      <hr>
      <div class="form-control">
        <div class="col-sm-10">
      <table width="380" style="margin-left: 20px;"><br>
            <h3 style="margin-left: 20px; color: #682D87;">MY PROFILE</h3>
              <hr>
                <tr>
                    <td>Staff Id :
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $id; ?></td>
                </tr>
                <tr>
                    <td>Staff Name :
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $name; ?></td>
                </tr>
                <tr>
                    <td>Date of joining :
                    &nbsp;&nbsp;<?php echo $date; ?></td>
                </tr>
                <tr>
                  <td>Department :
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $department;  ?></td>
                </tr>
                <tr>
                  <td>Designation :
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $des;  ?></td>
                </tr>
                <tr>
                  <td>Qualification :
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<?php echo $qua;  ?></td>
                </tr>

              </table>
              <br>
            </div>
        </div><hr>
  </div>
</div>
</center>
</body>
 </html>
