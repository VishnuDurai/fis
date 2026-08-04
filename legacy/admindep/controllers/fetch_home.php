<?php
session_start();
if(isset($_SESSION['staff_id'])){
    $staff_id = $_SESSION['staff_id'];
    require('../models/dbcon.php');
    $sql = mysqli_query($conn,"SELECT * FROM admin_dep WHERE staff_id = '$_SESSION[staff_id]'");
    $row_cnt = mysqli_num_rows($sql);

    if($row_cnt == 1){
        $row = mysqli_fetch_array($sql);
        $id = $row['staff_id'];
        $dept = $row['Department'];
    }
}
?>

                <form class="form-horizontal">
                <div class="form-group w3-animate-left">
                <b><marquee behavior="alternate"><label class="col-sm-3" for="staff_id">Username:</label>
                <div class="col-sm-9">
                &nbsp;
                <?php echo $id; ?>
                </div></marquee></b>
                </div>

                <div class="form-group w3-animate-right">
                <b><marquee behavior="alternate"><label class="col-sm-3" for="staff_name">Department:</label>
                <div class="col-sm-9">
                &nbsp;
                <?php echo $dept; ?>
                </div></marquee></b>
                </div>
                </form>
