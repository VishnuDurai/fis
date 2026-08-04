<?php
     
        require('../models/dbcon.php');
        mysqli_set_charset($conn,"utf8");
        $sql = mysqli_query($conn,"select * from degree");
        $output = array();
        while($row=mysqli_fetch_array($sql)){
            $output[] = $row;
        }
        echo json_encode($output); 
        

?>