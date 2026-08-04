<?php
session_start();
require ('DB/dbcon.php');

if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}

$result = mysql_query("SELECT * FROM admin WHERE staff_id = '$_SESSION[staff_id]'")
or die("there is no records to display..\n" . mysql_error());
if(mysql_num_rows($result)<1)
{
  $result = null;
}

$row = mysql_fetch_array($result);

if($row)
{
  $id = $row['staff_id'];
  $pass = $row['password'];
}
 ?>
 <?php
 if(isset($_POST['update']))
 {
   $id = $_GET[staff_id];
   $myPassword = $_POST['password'];
   $conpass = $_POST['ConfirmPassword'];
   if($myPassword == $conpass)
   {
   $sql = mysql_query("update admin set password='$myPassword' where staff_id = '$id'")
   or die(mysql_error());
   header("location: manage-profile.php");
   }else {
     echo "<script>alert('password not match..!')</script>";
   }
   }
  ?>
<html>
<head>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script language="JavaScript" src="js/user.js"></script>
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
<body bgcolor="tan">
  <center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
  <div id ="page">
    <div id = "header">
    </div>
    <div class= "container">
  <center>  <?php include('navbar.php');?></center><hr>

  <div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Manage Your Profile </marquee></b></div><hr>

    <div class="form-control">
      <table>
        <tr>
          <td>
            <table width="380" align="center" style="margin-left: 20px; float: left;"><br>
              <!--<h3 style="margin-left: 20px; color: #682D87;">MY PROFILE</h3><hr><br>
              <tr>
                    <td>Staff_id :</td>
                    <td class="form-control"><?php //echo $id; ?></td>
              </tr>
              <tr>
                  <td>Password :</td>
                  <td class="form-control"><?php //echo $pass; ?></td>
              </tr>
              </table><hr>
      <CAPTION><h3 style="margin-left: 20px; color: #682D87;">UPDATE PROFILE</h3><hr></CAPTION>
      <form action="manage-profile.php?staff_id=<?php //echo $_SESSION['staff_id']; ?>" method="post" onsubmit="return updateProfile(this)">
        <table style="margin-left: 20px;">
            <tr><td>New Password :</td><td><input type="password" class="form-control" style="background-color:white; font-weight:bold;" name="password"  value="" required></td></tr>
            <tr><td>Confirm New Password :</td><td><input type="password" class="form-control" style="background-color:white; font-weight:bold;" name="ConfirmPassword"  value="" required></td></tr>
            <tr><td>&nbsp;</td><td><br><input type="submit" name="update" class="btn btn-outline-success" style="cursor: pointer;" value="Update Profile"></td></tr>
        </table>
      </form><br>-->
      <CAPTION><h3 style="margin-left: 20px; color: #682D87;">ADD NEW USERS</h3><hr></CAPTION>
      <form action="manage-profile.php" method="post">
        <table style="margin-left: 20px;">
          <tr><td>Staff Id</td><td><input type="text" class="form-control" style="background-color:white; font-weight:bold;" name="staff_id"  value="" required></td></tr>
          <tr><td>password</td><td><input type="password" class="form-control" style="background-color:white; font-weight:bold;" name="password"  value="" required></td></tr>
          <tr><td>&nbsp;</td><td><br><input type="submit" name="add" class="btn btn-outline-success" style="cursor: pointer;" value="ADD NEW USER"></td></tr>
        </table>
      </form>
     </td>
    </tr>
  </table><br>
</div>
</div>
  <hr>
 </div>
  </body>
  </html>
<?php
require ('DB/dbcon.php');
if(isset($_POST['add'])){
  $sql = mysql_query("insert into staff_user (staff_id,password) values ('".$_POST['staff_id']."','".$_POST['password']."') ");
  if($sql){
    header("location:add_user.php");
    echo "<script type='text/javascript'>alert('Added successfully !')</script>";
  }
}

?>
