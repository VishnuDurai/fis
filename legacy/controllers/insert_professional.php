<?php
    session_start();
    require('../models/dbcon.php');
    
    if(isset($_SESSION['staff_id'])){
        $id = mysqli_real_escape_string($conn,$_POST['staff_id']);
        $name = mysqli_real_escape_string($conn,$_POST['staff_name']);
        $membershipid = mysqli_real_escape_string($conn,$_POST['membershipid']);
        $organization = mysqli_real_escape_string($conn,$_POST['organization']);

        $sql = "insert into staff_member (staff_id,staff_name,membershipid,organization) values ('$id','$name','$membershipid','$organization')";
        if(mysqli_query($conn,$sql)){
            echo '<h3 style="color:green;">Professional Society Membership Detail Inserted Successfully.</h3>';
        }else{
            echo '<p style="color:red;">Data inserted Failed</p>';
        }
    }
?>