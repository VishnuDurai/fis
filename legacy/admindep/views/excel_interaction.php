<?php require('../models/restrict.php');
require('../models/dbcon.php');
        mysqli_set_charset($conn,"utf8");
if(empty($_SESSION['staff_id']))
{
  header("location:access-denied.php");
}
$result = mysqli_query($conn,"SELECT * FROM admin_dep WHERE staff_id = '$_SESSION[staff_id]'")
or die("there is no records to display..\n" . mysqli_error());
if(mysqli_num_rows($result)<1)
{
  $result = null;
}

$row = mysqli_fetch_array($result);

if($row)
{
  $id = $row['staff_id'];
  $pass=$row['password'];
  $dept = $row['Department'];
 }
 if(isset($_SESSION['staff_id'])){
     $staff_id = $_SESSION['staff_id'];
 require_once('../models/dbcon.php');
 
   header("Content-Disposition: attachment; filename=export_interaction.xls");
  
  header("Content-Type: application/vnd.ms-excel");
  
  function dataFilter(&$str_val)
  {
      $str_val = preg_replace("/\t/","\\t", $str_val);
      $str_val = preg_replace("/\r?\n/","\\n", $str_val);
      if(strstr($str_val, '"')) $str_val = '"' . str_replace('"', '""', $str_val) . '"';
  }
  $post_list = array();
     //get rows query
     
       $query = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.staff_name,i.type,i.title,i.from_date,i.to_date,i.organizer from staff_academics a,staff_interaction i where a.staff_id = i.staff_id and a.Department='".$dept."'order by a.Designation desc,i.from_date");
       //number of rows
 
     $rowcount = mysqli_num_rows($query);
     if($rowcount > 0){
         while($row = mysqli_fetch_assoc($query)){
             $post_list[] = array("staff_id"=>$row["staff_id"], "Department"=>$row["Department"], "Designation"=>$row["Designation"], "staff_name"=>$row["staff_name"], "type"=>$row["type"], "title"=>$row["title"], "from_date"=>$row["from_date"], "to_date"=>$row["to_date"], "organizer"=>$row["organizer"]);
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
