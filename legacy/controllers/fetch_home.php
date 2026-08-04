<?php
session_start();
if(isset($_SESSION['staff_id'])){
    $staff_id = $_SESSION['staff_id'];
    require('../models/dbcon.php');
    $sql = mysqli_query($conn,"SELECT * FROM staff_academics WHERE staff_id = '$_SESSION[staff_id]'");

    $row_cnt = mysqli_num_rows($sql);

    if($row_cnt == 1){
        $row = mysqli_fetch_array($sql);
        $id = $row['staff_id'];
        $name = $row['staff_name'];
        $date = $row['Date_of_joining'];
        $department = $row['Department'];
        $des = $row['Designation'];
        $qua = $row['Qualification'];
    }
}
?>

                <form class="form-horizontal">
                <div class="form-group">
                <label class="col-sm-3" for="staff_id">Staff Id:</label>
                <div class="col-sm-9">
                &nbsp;<?php echo $id; ?>
                </div>
                </div>

                <div class="form-group">
                <label class="col-sm-3" for="staff_name">Staff Name:</label>
                <div class="col-sm-9">
                &nbsp;<?php echo $name; ?>
                </div>
                </div>

                <div class="form-group">
                <label class="col-sm-3" for="date_of_join">Date of Joining:</label>
                <div class="col-sm-9">
                &nbsp;<?php echo $date; ?>
                </div>
                </div>

                <div class="form-group">
                <label class="col-sm-3" for="department">Designation:</label>
                <div class="col-sm-9">
                &nbsp;<?php echo $des; ?>
                </div>
                </div>

                <div class="form-group">
                <label class="col-sm-3" for="designation">Department:</label>
                <div class="col-sm-9">
                &nbsp;<?php echo $department; ?>
                </div>
                </div>

                <div class="form-group">
                <label class="col-sm-3" for="qualification">Qualification:</label>
                <div class="col-sm-9">
                &nbsp;<?php echo $qua; ?>
                </div>
                </div>
                </form>
