<?php

        require ('DB/dbcon.php');
        //mysql_set_charset($conn,"utf8");
        $sql = mysql_query("select * from professional");
        $output = array();
        while($row=mysql_fetch_array($sql)){
            $output[] = $row;
        }
        echo json_encode($output);


?>
