<?php 
ini_set("display_errors","1");
error_reporting(E_ALL);

ob_start();
session_start();
require ('DB/dbcon.php');
 ?>

<html>
<head>
  <title></title>
  <link href="css/user_style.css" rel="stylesheet" type="text/css"/>
</head>
<body bgcolor="tan">
<center><b><font color = "brown" size="6">Staff information</font></b></center><br><br>
<body>
  <div id = "page">
    <div id = "header">
      <h1>Invalid credentails provided</h1>
      <p align="center">&nbsp;</p>

    </div>
    <div id = "container">
      <?php
      

      $myusername = mysql_real_escape_string($_POST['myusername']);
      $mypassword = mysql_real_escape_string($_POST['mypassword']);
      $sql = "SELECT * FROM admin WHERE staff_id='{$myusername}' and password='{$mypassword}'" or die(mysql_error());
      $result = mysql_query($sql) or die(mysql_error());

      $count = mysql_num_rows($result);

      if($count == 1)
      {
        $user = mysql_fetch_assoc($result);
        $_SESSION['staff_id'] = $user['staff_id'];
        header("location:staff.php");
      }else {
        echo "Wrong Username or password<br><br>Return to <a href=\"index.php\">Login</a>";
      }
      ob_end_flush();
       ?>
    </div>
  </div>
</body>
</html>
