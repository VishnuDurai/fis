<?php
    session_start();
    require('../models/dbcon.php');

    if($_FILES["file"]["name"] != ""){
        $staff_id = $_SESSION['staff_id'];
        $file = rand(1000,100000)."-".$_FILES['file']['name'];
        $file_loc = $_FILES['file']['tmp_name'];
        $file_size = $_FILES['file']['size'];
        $file_type = $_FILES['file']['type'];
        $folder="../admin/upload/";

   // new file size in KB
   $new_size = $file_size/10000;
   // new file size in KB

   // make file name in lower case
   $new_file_name = strtolower($file);
   // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);
 if(move_uploaded_file($file_loc,$folder.$final_file)){
        $sql = mysqli_query($conn,"update admin_dep set file ='$final_file' where staff_id = '$staff_id'");
    }
}
?>
