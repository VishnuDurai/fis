<?php
    session_start();
    if(isset($_SESSION['staff_id'])){
        $staff_id = $_SESSION['staff_id'];
        require('../models/dbcon.php');
        mysqli_set_charset($conn,"utf8");
        $sql = mysqli_query($conn,"select a.Department,a.Designation,a.staff_name,i.id,i.file,i.staff_id,i.category,i.specialization,i.institute,i.board,i.year,i.percentage from staff_academics a,staff_edu i where i.staff_id=a.staff_id and i.staff_id = '$staff_id'");
        $output = array();
        while($row=mysqli_fetch_assoc($sql)){
            $output[] = $row;
        }
        echo json_encode($output); 
        }
?>