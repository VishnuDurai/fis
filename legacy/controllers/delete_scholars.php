<?php
    require ('../models/dbcon.php');
    if(isset($_POST['id']))
    {
        $id = $_POST['id'];
        $sql = "delete from staff_scholars where id='$id'";
        $result = mysqli_query($conn,$sql);
        echo 'One Record Deleted Successfull!';
}
?>