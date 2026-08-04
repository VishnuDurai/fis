<?php
session_start();
require ('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
$result1 = mysql_query("select * from professional");
if(mysql_num_rows($result)<1)
{
  $result = null;
}

$row = mysql_fetch_array($result);

if($row)
{
  $id = $row['staff_id'];
  $name = $row['staff_name'];
 }
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
<body>
  <body bgcolor="tan"><br>
  <center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
  <div id="page">
  <div id="header">
  </div>
  <div class="container">
  	<!--<center><?php //include('navbar.php');?></center><hr>-->
    <!--<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Interaction Report</marquee></b></div><hr>-->
      <form method="post" action="fetch_professional.php">
       <center><h3 style="color: #682D87;">Professional Details</h3></center>
        <hr>
        <div class="form-container offset-sm-4"><br>
          <div class="form-group">
            <label style="color: white;">Staff ID</label>
            <div class="form-inline">
            <input type="number" name="id" class="form-control col-sm-4" name="staffid">&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="submit" class="btn btn-info" style="cursor:pointer;" name="Getid" value="Staff Report">
          </div></div>
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
             </select>&nbsp;&nbsp;&nbsp;&nbsp;<input type="submit" class="btn btn-info" style="cursor:pointer;" name="GetDept" value="Department Report"></div></div><br>
             <div class="form-group has-success">
                            <label style="color: white;" class="col-sm-3">Organization</label>
                            <div class="col-sm-9">
                                <select type="text" name="organization" id="organization" class="form-control" placeholder="organization">
                                  <?php
                            			while($row1 = mysql_fetch_array($result1)):;
                            			?>
                            			<option><?php
                            			echo $row1[1];
                            			?></option>
                            			<?php
                            			endwhile;
                            			?>
                                </select>&nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                        </div>
             <input type="submit" class="btn btn-info" style="cursor:pointer;" name="GetOrg" value="Professional Society Report"></div></div><br>
          <a href="staff.php"><input type="button" class="btn btn-danger offset-sm-1" style="cursor:pointer;" value="BACK"></a>
           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input type="submit" class="btn btn-success" style="cursor:pointer;" name="submit" value="Institution Report">
  </div>
      </div><br>
        <br><hr>
  </form>
  </div>
  </div>
  </body>
<!-- <script>
$(document).ready(function(){
  function fetch_organization()
          {
            $.ajax({
                url:'fetch_org.php',
                method:'POST',
                dataType:'json',
                success:function(data){
                    for(c=0;c<data.length;c++){
                        $('select#organization').append('<option>'+data[c].pro_name+'</option>');
                    }
                }
            });
          }
        fetch_organization();
 });
  </script> -->
</body>
</html>
