<?php
require('../models/dbcon.php');
$sql = "update staff_user set ".$_POST["name"]." = '".$_POST["value"]."' where id = '".$_POST["pk"]."'";
mysqli_query($conn,$sql);
?>