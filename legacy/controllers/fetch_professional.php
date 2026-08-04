<?php
session_start();
if(isset($_SESSION['staff_id'])){
    $staff_id = $_SESSION['staff_id'];
    require('../models/dbcon.php');
    mysqli_set_charset($conn,"UTF8");
    $sql = mysqli_query($conn,"select * from staff_member where staff_id = '$staff_id'");
    $output = array();

    while($row=mysqli_fetch_assoc($sql)){
        $output[] = $row;
    }
    echo json_encode($output);
    }
?>
