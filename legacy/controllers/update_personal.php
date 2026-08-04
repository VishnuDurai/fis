<?php
require('../models/dbcon.php');
$sql = "update staff_personal set ".$_POST["name"]." = '".$_POST["value"]."' where id = '".$_POST["pk"]."'";
mysqli_query($conn,$sql);
?>