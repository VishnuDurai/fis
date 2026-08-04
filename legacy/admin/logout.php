<?php
session_start();
session_destroy();
header("location:index.php");
?>
<html><head>
<link href="css/user_style.css" rel="stylesheet" type="text/css" />
</head><body bgcolor="tan">
<center><b><font color = "brown" size="6">Staff information</font></b></center><br><br>
<div id="page">
<div id="header">
<h1>Logged Out Successfully </h1>
<p align="center">&nbsp;</p>
</div>
<div style="margin-left:370px;"><b>You have been successfully logged out.</b></div><br><br><br>
<div  style="margin-left:450px;"><b>Return to <a href="index.php">Login</a></b></div>
<div id="footer">
<a>&nbsp;</a>
</div>
</div>
</body></html>
