<?php 
session_start();
if(isset($_SESSION['staff_id'])){
    $staff_id = $_SESSION['staff_id'];
require_once('../models/dbcon.php');

//headers for exporting the excel file

header("Content-Disposition: attachment; filename=export_publication.xls");

header("Content-Type: application/vnd.ms-excel");

function dataFilter(&$str_val)
{
    $str_val = preg_replace("/\t/","\\t", $str_val);
    $str_val = preg_replace("/\r?\n/","\\n", $str_val);
    if(strstr($str_val, '"')) $str_val = '"' . str_replace('"', '""', $str_val) . '"';
}

$post_list = array();

//get rows query

$query = mysqli_query($conn,"SELECT * FROM staff_publication WHERE staff_id = '$staff_id'");

//number of rows
$rowcount = mysqli_num_rows($query);

if($rowcount > 0){
    while($row = mysqli_fetch_assoc($query)){
        $post_list[] = array("staff_name"=>$row["staff_name"], "type_pub"=>$row["type_pub"], "role"=>$row["role"], "type"=>$row["type"], "title"=>$row["title"], "journel"=>$row["journel"], "date_con"=>$row["date_con"], "organizer"=>$row["organizer"], "doi"=>$row["doi"], "isbn"=>$row["isbn"], "month_pub"=>$row["month_pub"], "volumn_pub"=>$row["volume_pub"], "pp"=>$row["pp"], "index_pub"=>$row["index_pub"], "web_of_science"=>$row["web_of_science"], "citations"=>$row["citations"], "hindex"=>$row["hindex"], "impact"=>$row["impact"]);
    }

}


$title_flag = false;
foreach($post_list as $post){
    if(!$title_flag){
        //showing column name
        echo implode("\t", array_keys($post)) . "\n";
        $title_flag = true;
    }
    //data filtering
    array_walk($post, 'dataFilter');
    echo implode("\t", array_values($post)) . "\n";

}
}

?>