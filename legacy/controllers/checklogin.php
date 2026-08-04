<?php
session_start();
    require('../models/dbcon.php');
    if(isset($_POST['username'])&&isset($_POST['password'])){
        $staff_id = $_POST['username'];
        $password = $_POST['password'];
        $sql = "select * from staff_user where staff_id = '$staff_id' and password = '$password'";
        $result = mysqli_query($conn,$sql);
        $row_cnt = mysqli_num_rows($result);
        if($row_cnt == 1){
            echo 'Successfull';
            $user = mysqli_fetch_assoc($result);
            $_SESSION['staff_id'] = $user['staff_id'];
        }else{
            echo 'Invalid';
        }
    }
?>