<?php require('../models/restrict.php');
header('Content-type: text/html; charset=utf-8');?>
<!DOCTYPE html>
<html ng-app>
<head>
  <title>Report</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.min.js"></script>
<script src="./jquery.js" type="text/JavaScript" language="javascript"></script>
      <script src="./jquery.PrintArea.js" type="text/JavaScript" language="javascript"></script>
<style type="text/css" media="print">
@page{
  size:auto;
  margin:0;
}
</style>
</head>
<body bgcolor="tan">
  <center><b><font style="color: #176281;" size="6">SREC FIS</font></b></center><br>
  <div id="page">
  <div id="header">
  </div>
  <center><h3 style="color: #682D87;">Individual Faculty Report</h3></center>
     <hr>
     <div class="form-inline">
<a href="report.php"><button type="button" style=" cursor: pointer;" class="btn btn-outline-danger btn-sm"> Back </button></a>
<div class="wrapper">
<a href="javascript:void(0);" id="print_button2"><button class="btn btn-outline-primary btn-sm" style="cursor:pointer;">Download and Print</button></a>
<button name="export" id="export" class="btn btn-outline-success btn-sm" style="cursor:pointer;"><a href="export.php">Export Excel</a></button>
<input type="text" class="form-control col-sm-1" ng-model="text" placeholder="Header1">
<input type="text" class="form-control col-sm-1" ng-model="text1" placeholder="Header2">
<input type="text" class="form-control col-sm-1" ng-model="text2" placeholder="Header3">
<input type="text" class="form-control col-sm-1" ng-model="ftext" placeholder="Footer1">
<input type="text" class="form-control col-sm-1" ng-model="ftext1" placeholder="Footer2">
<input type="text" class="form-control col-sm-1" ng-model="ftext2" placeholder="Footer3">
     </div>
     </div>
     <br>
     <div class="content">
       <div class="row">
         <div class="col">
           <b>{{text}}</b>
         </div>
         <div class="col">
         <b>  {{text1}}</b>
         </div>
         <div class="col-1">
         <b>  {{text2}}</b>
         </div>
       </div>
       <?php include('header.php');?>
         <br><div class="row">
           <div class="col"><left>
             <?php
             require('../models/dbcon.php');
             mysqli_set_charset($conn,"UTF8");
             $sql = mysqli_query($conn,"select distinct staff_name,Department,Designation from staff_academics where staff_id='".$_POST['staffid']."'");
             while($row = mysqli_fetch_array($sql))  {
             $name = $row['staff_name'];
             $des = $row['Designation'];
             $dep = $row['Department'];?>
<br>
             <b><label>Staff Name:</label></b>&nbsp;<?php echo $name;?><br>
             <b><label>Designation:</label></b>&nbsp;<?php echo $des;?><br>
             <b><label>Department:</label></b>&nbsp;<?php echo $dep;?><br>
             <?php
              }
              ?>
           </div>
           <div class="col"><center>
             <b><label>Individual Faculty Report </label></b><br>

           </div>
           <div class="col">
             <b><label class="offset-6">Date: </label></b><?php $date = date('d-m-y'); echo $date;  ?>
           </div>
         </div>
         <!--Interaction Details-->
    <center>
      <?php
     require('../models/dbcon.php');
     mysqli_set_charset($conn,"UTF8");
     if(isset($_POST['submit1'])){
       $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.type,i.title,i.from_date,i.to_date,i.organizer from staff_academics a,staff_interaction i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."'order by i.from_date");
       if(mysqli_num_rows($sql) != null){
       $s =1;?>
       <b>Interaction Details</b><p>&nbsp;</p>
       <table class="table table-sm table-bordered">
             <thead class="table-sm table-success">
               <tr>
                 <th style="width:30px;">SNO</th>
                 <th style="width:100px; text-align:center;">Type</th>
                 <th style="width:300px; text-align:center;">Title</th>
                 <th style="width:100px; text-align:center;">From_Date</th>
                 <th style="width:100px; text-align:center;">To_date</th>
                 <th style="width:100px; text-align:center;">organizer</th>
                 </tr>
            </thead>
       <?php
       while($row = mysqli_fetch_array($sql)){
         $name = $row['staff_name'];
         $des = $row['Designation'];
         $dep = $row['Department'];
         $type = $row['type'];
         $title = $row['title'];
         $from = $row['from_date'];
         $to = $row['to_date'];
         $org = $row['organizer'];?>
         <tbody>
           <td><?php echo $s;?></td>
           <td style="width:200px; text-align:left;"><?php echo $type;?></td>
           <td style="width:200px; text-align:left;"><?php echo $title;?></td>
           <td style="width:200px; text-align:left;"><?php echo $from;?></td>
           <td style="width:200px; text-align:left;"><?php echo $to;?></td>
           <td style="width:200px; text-align:left;"><?php echo $org;?></td>
         </tbody>
         <?php
         $s++;
       }
     }else{
       echo "";
     }
   }if(isset($_POST['GetAll'])){
     $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.type,i.title,i.from_date,i.to_date,i.organizer from staff_academics a,staff_interaction i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by i.from_date");
     if(mysqli_num_rows($sql) != null){
     $s =1;?>
     <b>Interaction Details</b><p>&nbsp;</p>
     <table class="table table-sm table-bordered">
           <thead class="table-sm table-success">
             <tr>
               <th style="width:30px;">SNO</th>
               <th style="width:100px; text-align:center;">Type</th>
               <th style="width:300px; text-align:center;">Title</th>
               <th style="width:100px; text-align:center;">From_Date</th>
               <th style="width:100px; text-align:center;">To_date</th>
               <th style="width:100px; text-align:center;">organizer</th>
               </tr>
          </thead>
     <?php
     while($row = mysqli_fetch_array($sql)){
       $name = $row['staff_name'];
       $des = $row['Designation'];
       $dep = $row['Department'];
       $type = $row['type'];
       $title = $row['title'];
       $from = $row['from_date'];
       $to = $row['to_date'];
       $org = $row['organizer'];?>
       <tbody>
         <td><?php echo $s;?></td>
         <td style="width:200px; text-align:left;"><?php echo $type;?></td>
         <td style="width:200px; text-align:left;"><?php echo $title;?></td>
         <td style="width:200px; text-align:left;"><?php echo $from;?></td>
         <td style="width:200px; text-align:left;"><?php echo $to;?></td>
         <td style="width:200px; text-align:left;"><?php echo $org;?></td>
       </tbody>
       <?php
       $s++;
     }
   }else{
     echo "";
   }
   }
?>
   </table></center>
   <!-- Funding -->
   <center>
   <?php
     require('../models/dbcon.php');
     mysqli_set_charset($conn,"UTF8");
     if(isset($_POST['submit1'])){
       $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.staff_name,i.copiid,i.copiname,i.fa,i.amount,i.date,i.title,i.status,i.referenceno from staff_academics a,staff_funding i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."'order by i.date");
       if(mysqli_num_rows($sql) != null){
       $s =1;?>
       <b>Funding Applied/Received details</b><p>&nbsp;</p>
       <table class="table table-sm table-bordered">
             <thead class="table-sm table-success">
               <tr>
                 <th style="width:30px;">SNO</th>
                 <th style="width:100px; text-align:center;">Co-Investigator/Faculty Name</th>
                 <th style="width:300px; text-align:center;">Co Investigator/Faculty ID</th>
                 <th style="width:100px; text-align:center;">Title</th>
                 <th style="width:100px; text-align:center;">Funding Agency</th>
                 <th style="width:100px; text-align:center;">Amount</th>
                 <th style="width:100px; text-align:center;">Date</th>
                 <th style="width:100px; text-align:center;">Status</th>
                 <th style="width:100px; text-align:center;">Reference No</th>
                 </tr>
            </thead>
       <?php
       while($row = mysqli_fetch_array($sql)){
         $name = $row['staff_name'];
         $des = $row['Designation'];
         $dep = $row['Department'];
         $coname = $row['copiname'];
         $coid = $row['copiid'];
         $title = $row['title'];
         $fa = $row['fa'];
         $amo = $row['amount'];
         $date = $row['date'];
         $stat = $row['status'];
         $refer = $row['referenceno'];?>
         <tbody>
           <td><?php echo $s;?></td>
           <td style="width:200px; text-align:left;"><?php echo $coname;?></td>
           <td style="width:200px; text-align:left;"><?php echo $coid;?></td>
           <td style="width:200px; text-align:left;"><?php echo $title;?></td>
           <td style="width:200px; text-align:left;"><?php echo $fa;?></td>
           <td style="width:200px; text-align:left;"><?php echo $amo;?></td>
           <td style="width:200px; text-align:left;"><?php echo $date;?></td>
           <td style="width:200px; text-align:left;"><?php echo $stat;?></td>
           <td style="width:200px; text-align:left;"><?php echo $refer;?></td>
         </tbody>
         <?php
         $s++;
       }
     }else{
       echo "";
     }
   }if(isset($_POST['GetAll'])){
     $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.staff_name,i.copiid,i.copiname,i.fa,i.amount,i.date,i.title,i.status,i.referenceno from staff_academics a,staff_funding i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and i.date between '".$_POST['from']."' and '".$_POST['to']."' order by i.date");
     if(mysqli_num_rows($sql) != null){
     $s =1;?>
     <b>Funding Applied/Received Details</b><p>&nbsp;</p>
     <table class="table table-sm table-bordered">
           <thead class="table-sm table-success">
             <tr>
             <th style="width:30px;">SNO</th>
             <th style="width:100px; text-align:center;">Co-Investigator/Faculty Name</th>
             <th style="width:300px; text-align:center;">Co Investigator/Faculty ID</th>
             <th style="width:100px; text-align:center;">Title</th>
             <th style="width:100px; text-align:center;">Funding Agency</th>
             <th style="width:100px; text-align:center;">Amount</th>
             <th style="width:100px; text-align:center;">Date</th>
             <th style="width:100px; text-align:center;">Status</th>
             <th style="width:100px; text-align:center;">Reference No</th>
             </tr>
          </thead>
     <?php
     while($row = mysqli_fetch_array($sql)){
      $name = $row['staff_name'];
      $des = $row['Designation'];
      $dep = $row['Department'];
      $coname = $row['copiname'];
      $coid = $row['copiid'];
      $title = $row['title'];
      $fa = $row['fa'];
      $amo = $row['amount'];
      $date = $row['date'];
      $stat = $row['status'];
      $refer = $row['referenceno'];?>
       <tbody>
           <td><?php echo $s;?></td>
           <td style="width:200px; text-align:left;"><?php echo $coname;?></td>
           <td style="width:200px; text-align:left;"><?php echo $coid;?></td>
           <td style="width:200px; text-align:left;"><?php echo $title;?></td>
           <td style="width:200px; text-align:left;"><?php echo $fa;?></td>
           <td style="width:200px; text-align:left;"><?php echo $amo;?></td>
           <td style="width:200px; text-align:left;"><?php echo $date;?></td>
           <td style="width:200px; text-align:left;"><?php echo $stat;?></td>
           <td style="width:200px; text-align:left;"><?php echo $refer;?></td>
         </tbody>
         <?php
         $s++;
       }
     }else{
       echo "";
     }
    }
?>
   </table></center>
   <!--Publication-->
   <center>
   <?php
  require('../models/dbcon.php');
  mysqli_set_charset($conn,"UTF8");
  if(isset($_POST['submit1'])){
    $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.title,i.journel,i.doi,i.type_pub,i.month_pub,i.volume_pub,i.pp,i.index_pub,i.web_of_science from staff_academics a,staff_publication i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and i.type_pub='Journal' order by month_pub");
    if(mysqli_num_rows($sql) != null){
    $s =1;?>
    <b>Journal Publication Details</b><p>&nbsp;</p>
    <table class="table table-sm table-bordered">
          <thead class="table-sm table-success">
            <tr>
              <th style="width:30px;">SNO</th>
              <th style="width:100px; text-align:center;">Title</th>
              <th style="width:300px; text-align:center;">Name of the Journal</th>
              <th style="width:300px; text-align:center;">DOI</th>
              <th style="width:100px; text-align:center;">Month</th>
              <th style="width:100px; text-align:center;">Volume</th>
              <th style="width:100px; text-align:center;">PP</th>
              <th style="width:100px; text-align:center;">Scopous Indexed</th>
              <th style="width:100px; text-align:center;">Web of Science Indexed</th>
              </tr>
         </thead>
    <?php
    while($row = mysqli_fetch_array($sql)){
      $name = $row['staff_name'];
      $des = $row['Designation'];
      $dep = $row['Department'];
      $title = $row['title'];
      $act = $row['journel'];
      $from = $row['doi'];
      $to = $row['month_pub'];
      $org = $row['volume_pub'];
      $pp=$row['pp'];
      $scp=$row['index_pub'];
      $web=$row['web_of_science'];?>
      <tbody>
        <td><?php echo $s;?></td>

        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
        <td style="width:200px; text-align:center;"><?php echo $act;?></td>
        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
        <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        <td style="width:200px; text-align:center;"><?php echo $pp;?></td>
        <td style="width:200px; text-align:center;"><?php echo $scp;?></td>
        <td style="width:200px; text-align:center;"><?php echo $web;?></td>

      </tbody>
      <?php
      $s++;
    }
  }else{
    echo "";
  }
}
if(isset($_POST['GetAll'])){
  $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.title,i.journel,i.doi,i.type_pub,i.month_pub,i.volume_pub,i.pp,i.index_pub,i.web_of_science from staff_academics a,staff_publication i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and i.type_pub='Journal' and month_pub between '".$_POST['from']."' and '".$_POST['to']."'");
    if(mysqli_num_rows($sql) != null){
    $s =1;?>
    <b>Journal Publication Details</b><p>&nbsp;</p>
    <table class="table table-sm table-bordered">
          <thead class="table-sm table-success">
            <tr>
              <th style="width:30px;">SNO</th>
              <th style="width:100px; text-align:center;">Title</th>
              <th style="width:300px; text-align:center;">Name of the Journal</th>
              <th style="width:300px; text-align:center;">DOI</th>
              <th style="width:100px; text-align:center;">Month</th>
              <th style="width:100px; text-align:center;">Volume</th>
              <th style="width:100px; text-align:center;">PP</th>
              <th style="width:100px; text-align:center;">Scopous Indexed</th>
              <th style="width:100px; text-align:center;">Web of Science Indexed</th>
              </tr>
         </thead>
    <?php
    while($row = mysqli_fetch_array($sql)){
      $name = $row['staff_name'];
      $des = $row['Designation'];
      $dep = $row['Department'];
      $title = $row['title'];
      $act = $row['journel'];
      $from = $row['doi'];
      $to = $row['month_pub'];
      $org = $row['volume_pub'];
      $pp=$row['pp'];
      $scp=$row['index_pub'];
      $web=$row['web_of_science'];
      ?>
      <tbody>
        <td><?php echo $s;?></td>

        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
        <td style="width:200px; text-align:center;"><?php echo $act;?></td>
        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
        <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        <td style="width:200px; text-align:center;"><?php echo $pp;?></td>
        <td style="width:200px; text-align:center;"><?php echo $scp;?></td>
        <td style="width:200px; text-align:center;"><?php echo $web;?></td>
      </tbody>
      <?php
      $s++;
    }
  }else{
    echo "";
  }
}
?>
</table></center>
<!--Conference published-->
<center>
<?php
require('../models/dbcon.php');
mysqli_set_charset($conn,"UTF8");
if(isset($_POST['submit1'])){
  $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.title,i.journel,i.type_pub,i.date_con,i.organizer from staff_academics a,staff_publication i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and i.type_pub='Conference' order by i.date_con");
 if(mysqli_num_rows($sql) != null){
 $s =1;?>
 <b>Conference Publication Details</b><p>&nbsp;</p>
 <table class="table table-sm table-bordered">
       <thead class="table-sm table-success">
         <tr>
           <th style="width:30px;">SNO</th>

           <th style="width:100px; text-align:center;">Title of article</th>
           <th style="width:300px; text-align:center;">Name of the conference</th>
           <th style="width:300px; text-align:center;">Date of the conference</th>
           <th style="width:100px; text-align:center;">Organizer</th>
           </tr>
      </thead>
 <?php
 while($row = mysqli_fetch_array($sql)){
   $name = $row['staff_name'];
   $des = $row['Department'];
   $dep = $row['Designation'];
   $title = $row['title'];
   $act = $row['journel'];
   $from = $row['date_con'];
   $to = $row['organizer'];?>
   <tbody>
     <td><?php echo $s;?></td>

     <td style="width:200px; text-align:center;"><?php echo $title;?></td>
     <td style="width:200px; text-align:center;"><?php echo $act;?></td>
     <td style="width:200px; text-align:center;"><?php echo $from;?></td>
     <td style="width:200px; text-align:center;"><?php echo $to;?></td>
   </tbody>
   <?php
   $s++;
 }
}else{
 echo "";
}
}if(isset($_POST['GetAll'])){
  $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.title,i.journel,i.type_pub,i.date_con,i.organizer from staff_academics a,staff_publication i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and i.date_con between '".$_POST['from']."' and '".$_POST['to']."' and i.type_pub='Conference' order by i.date_con");
  if(mysqli_num_rows($sql) != null){
  $s =1;?>
  <b>Conference Publication Details</b><p>&nbsp;</p>
  <table class="table table-sm table-bordered">
        <thead class="table-sm table-success">
          <tr>
            <th style="width:30px;">SNO</th>
            <th style="width:100px; text-align:center;">Title of article</th>
            <th style="width:300px; text-align:center;">Name of the conference</th>
            <th style="width:300px; text-align:center;">Date of the conference</th>
            <th style="width:100px; text-align:center;">Organizer</th>
            </tr>
       </thead>
  <?php
  while($row = mysqli_fetch_array($sql)){
    $name = $row['staff_name'];
    $des = $row['Department'];
    $dep = $row['Designation'];
    $title = $row['title'];
    $act = $row['journel'];
    $from = $row['date_con'];
    $to = $row['organizer'];?>
    <tbody>
      <td><?php echo $s;?></td>
      <td style="width:200px; text-align:center;"><?php echo $title;?></td>
      <td style="width:200px; text-align:center;"><?php echo $act;?></td>
      <td style="width:200px; text-align:center;"><?php echo $from;?></td>
      <td style="width:200px; text-align:center;"><?php echo $to;?></td>
    </tbody>
    <?php
    $s++;
  }
  }else{
  echo "";
  }
}
?>
</table></center>
   <!--Book Published-->
   <center>
     <?php
    require('../models/dbcon.php');
    mysqli_set_charset($conn,"UTF8");
    if(isset($_POST['submit1'])){
      $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.title,i.coauthor,i.publisher,i.edition,i.isbn,i.dateofpublication from staff_academics a,staff_book_published i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."'");
      if(mysqli_num_rows($sql) != null){
      $s =1;?>
      <b>Book Published Details</b><p>&nbsp;</p>
      <table class="table table-sm table-bordered">
           <thead class="table-sm table-success">
             <tr>
               <th style="width:30px;">SNO</th>

               <th style="width:200px; text-align:center;">TitleOfBook</th>
               <th style="width:200px; text-align:center;">Co-Author</th>
               <th style="width:100px; text-align:center;">Publisher</th>
               <th style="width:300px; text-align:center;">Edition</th>
               <th style="width:100px; text-align:center;">ISSN/ISBN</th>
               <th style="width:200px; text-align:center;">Date Of Publication</th>
               </tr>
          </thead>
      <?php
      while($row = mysqli_fetch_array($sql)){
        $name = $row['staff_name'];
        $des = $row['Designation'];
        $dep = $row['Department'];
        $type = $row['title'];
        $title = $row['coauthor'];
        $from = $row['publisher'];
        $to = $row['edition'];
        $org = $row['isbn'];
		$dop = $row['dateofpublication']?>
        <tbody>
          <td><?php echo $s;?></td>

          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
		  <td style="width:200px; text-align:center;"><?php echo $dop;?></td>
        </tbody>
        <?php
        $s++;
      }
    }else{
      echo "";
    }
  }if(isset($_POST['GetAll'])){
    $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.title,i.coauthor,i.publisher,i.edition,i.isbn,i.dateofpublication from staff_academics a,staff_book_published i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and i.dateofpublication between '".$_POST['from']."' and '".$_POST['to']."' order by i.dateofpublication");
    if(mysqli_num_rows($sql) != null){
    $s =1;?>
    <b>Book Published Details</b><p>&nbsp;</p>
    <table class="table table-sm table-bordered">
         <thead class="table-sm table-success">
           <tr>
             <th style="width:30px;">SNO</th>

             <th style="width:200px; text-align:center;">TitleOfBook</th>
             <th style="width:200px; text-align:center;">Co-Author</th>
             <th style="width:100px; text-align:center;">Publisher</th>
             <th style="width:300px; text-align:center;">Edition</th>
             <th style="width:100px; text-align:center;">ISSN/ISBN</th>
             <th style="width:100px; text-align:center;">Publication Date</th>
             </tr>
        </thead>
    <?php
    while($row = mysqli_fetch_array($sql)){
      $name = $row['staff_name'];
      $des = $row['Designation'];
      $dep = $row['Department'];
      $type = $row['title'];
      $title = $row['coauthor'];
      $from = $row['publisher'];
      $to = $row['edition'];
      $org = $row['isbn'];
      $date = $row['dateofpublication'];?>
      <tbody>
        <td><?php echo $s;?></td>

        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
        <td style="width:200px; text-align:center;"><?php echo $title;?></td>
        <td style="width:200px; text-align:center;"><?php echo $from;?></td>
        <td style="width:200px; text-align:center;"><?php echo $to;?></td>
        <td style="width:200px; text-align:center;"><?php echo $org;?></td>
        <td style="width:200px; text-align:center;"><?php echo $date;?></td>

      </tbody>
      <?php
      $s++;
    }
  }else{
    echo "";
  }
}
    ?>
  </table></center>
  <!--Resource Person-->
  <center>
    <?php
   require('../models/dbcon.php');
   mysqli_set_charset($conn,"UTF8");
   if(isset($_POST['submit1'])){
     $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.type,i.title,i.actedas,i.from_date,i.to_date,i.organizer from staff_academics a,staff_resource i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.from_date");
     if(mysqli_num_rows($sql) != null){
     $s =1;?>
     <b>Resource Person Details</b><p>&nbsp;</p>
     <table class="table table-sm table-bordered">
     <thead class="table-sm table-success">
     <tr>
       <th style="width:30px;">SNO</th>

       <th style="width:100px; text-align:center;">Type</th>
       <th style="width:300px; text-align:center;">Title</th>
       <th style="width:300px; text-align:center;">ActedAs</th>
       <th style="width:100px; text-align:center;">From_Date</th>
       <th style="width:100px; text-align:center;">To_date</th>
       <th>organizer</th>
      </tr>
     </thead>
     <?php
     while($row = mysqli_fetch_array($sql)){
       $name = $row['staff_name'];
       $des = $row['Designation'];
       $dep = $row['Department'];
       $type = $row['type'];
       $title = $row['title'];
       $act = $row['actedas'];
       $from = $row['from_date'];
       $to = $row['to_date'];
       $org = $row['organizer'];?>
       <tbody>
         <td><?php echo $s;?></td>

         <td style="width:200px; text-align:center;"><?php echo $type;?></td>
         <td style="width:200px; text-align:center;"><?php echo $title;?></td>
         <td style="width:200px; text-align:center;"><?php echo $act;?></td>
         <td style="width:200px; text-align:center;"><?php echo $from;?></td>
         <td style="width:200px; text-align:center;"><?php echo $to;?></td>
         <td style="width:200px; text-align:center;"><?php echo $org;?></td>

       </tbody>
       <?php
       $s++;
           }
         }else{
           echo "";
         }
       }if(isset($_POST['GetAll'])){
         $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.type,i.title,i.actedas,i.from_date,i.to_date,i.organizer from staff_academics a,staff_resource i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by i.from_date");
         if(mysqli_num_rows($sql) != null){
         $s =1;?>
         <b>Resource Person Details</b><p>&nbsp;</p>
         <table class="table table-sm table-bordered">
         <thead class="table-sm table-success">
         <tr>
           <th style="width:30px;">SNO</th>

           <th style="width:100px; text-align:center;">Type</th>
           <th style="width:300px; text-align:center;">Title</th>
           <th style="width:300px; text-align:center;">ActedAs</th>
           <th style="width:100px; text-align:center;">From_Date</th>
           <th style="width:100px; text-align:center;">To_date</th>
           <th>organizer</th>
          </tr>
         </thead>
         <?php
         while($row = mysqli_fetch_array($sql)){
           $name = $row['staff_name'];
           $des = $row['Designation'];
           $dep = $row['Department'];
           $type = $row['type'];
           $title = $row['title'];
           $act = $row['actedas'];
           $from = $row['from_date'];
           $to = $row['to_date'];
           $org = $row['organizer'];?>
           <tbody>
             <td><?php echo $s;?></td>

             <td style="width:200px; text-align:center;"><?php echo $type;?></td>
             <td style="width:200px; text-align:center;"><?php echo $title;?></td>
             <td style="width:200px; text-align:center;"><?php echo $act;?></td>
             <td style="width:200px; text-align:center;"><?php echo $from;?></td>
             <td style="width:200px; text-align:center;"><?php echo $to;?></td>
             <td style="width:200px; text-align:center;"><?php echo $org;?></td>

           </tbody>
           <?php
           $s++;
               }
             }else{
               echo "";
             }
       }
   ?>
 </table></center>
 <!--Award-->
 <center>
   <?php
  require('../models/dbcon.php');
  mysqli_set_charset($conn,"UTF8");
  if(isset($_POST['submit1'])){
    $sql = mysqli_query($conn,"select distinct a.Department,i.staff_name,i.awardname,i.awardby,i.event, i.awa_date from staff_academics a,staff_award i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.awa_date");
    if(mysqli_num_rows($sql) != null){
    $s =1;?>
    <b>Award Details</b><p>&nbsp;</p>
    <table class="table table-sm table-bordered">
       <thead class="table-sm table-success">
         <tr>
           <th style="width:30px;">SNO</th>

           <th style="width:100px; text-align:center;">Award Name</th>
           <th style="width:100px; text-align:center;">Awarded By</th>
           <th style="width:100px; text-align:center;">Date</th>
           <th style="width:100px; text-align:center;">Event</th>
           </tr>
      </thead>
    <?php
    while($row = mysqli_fetch_array($sql)){
      //$name = $row['staff_id'];
      $des = $row['staff_name'];
      $dep = $row['awardname'];
      $type = $row['awardby'];
      $title = $row['event'];
      $date = $row['awa_date'] ?>
      <tbody>
        <td><?php echo $s;?></td>

        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
        <td style="width:200px; text-align:center;"><?php echo $date;?></td>
        <td style="width:200px; text-align:center;"><?php echo $title;?></td>

      </tbody>
      <?php
      $s++;
    }
    }else{
     echo "";
    }
  }if(isset($_POST['GetAll'])){
    $sql = mysqli_query($conn,"select distinct a.Department,i.staff_name,i.awardname,i.awardby,i.event,i.awa_date from staff_academics a,staff_award i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' and i.awa_date between '".$_POST['from']."' and '".$_POST['to']."' order by i.awa_date");
    if(mysqli_num_rows($sql) != null){
    $s =1;?>
    <b>Award Details</b><p>&nbsp;</p>
    <table class="table table-sm table-bordered">
       <thead class="table-sm table-success">
         <tr>
           <th style="width:30px;">SNO</th>

           <th style="width:100px; text-align:center;">Award Name</th>
           <th style="width:100px; text-align:center;">Awarded By</th>
           <th style="width:100px; text-align:center;">Date</th>
           <th style="width:100px; text-align:center;">Event</th>
           </tr>
      </thead>
    <?php
    while($row = mysqli_fetch_array($sql)){
      //$name = $row['staff_id'];
      $des = $row['staff_name'];
      $dep = $row['awardname'];
      $type = $row['awardby'];
      $title = $row['event'];
      $date = $row['awa_date']?>
      <tbody>
        <td><?php echo $s;?></td>

        <td style="width:200px; text-align:center;"><?php echo $dep;?></td>
        <td style="width:200px; text-align:center;"><?php echo $type;?></td>
        <td style="width:200px; text-align:center;"><?php echo $date;?></td>
        <td style="width:200px; text-align:center;"><?php echo $title;?></td>

      </tbody>
      <?php
      $s++;
    }
    }else{
     echo "";
    }
  }
  ?>
</table></center>
 <!--Intelletual property Right-->
 <center>
    <?php
      require('../models/dbcon.php');
      mysqli_set_charset($conn,"UTF8");
      if(isset($_POST['submit1'])){
        $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.patent,i.institution,i.generation,i.propose from staff_academics a,staff_ipr i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.generation");
        if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Intelletual Property Rights</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
    <thead class="table-sm table-success">
      <tr>
        <th style="width:30px;">SNO</th>

        <th style="width:100px; text-align:center;">Patent</th>
        <th style="width:300px; text-align:center;">Institution</th>
        <th style="width:100px; text-align:center;">Generation</th>
        <th style="width:100px; text-align:center;">Propose</th>
        </tr>
   </thead>
<?php
while($row = mysqli_fetch_array($sql)){
  $name = $row['staff_name'];
  $des = $row['Designation'];
  $dep = $row['Department'];
  $type = $row['patent'];
  $title = $row['institution'];
  $from = $row['generation'];
  $to = $row['propose'];
?>
  <tbody>
    <td><?php echo $s;?></td>

    <td style="width:200px; text-align:center;"><?php echo $type;?></td>
    <td style="width:200px; text-align:center;"><?php echo $title;?></td>
    <td style="width:200px; text-align:center;"><?php echo $from;?></td>
    <td style="width:200px; text-align:center;"><?php echo $to;?></td>
  </tbody>
  <?php
  $s++;
      }
    }else{
      echo "";
    }
  }if(isset($_POST['GetAll'])){
    $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.patent,i.institution,i.generation,i.propose from staff_academics a,staff_ipr i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and generation between '".$_POST['from']."' and '".$_POST['to']."' order by i.generation");
    if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Intelletual Property Rights</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
<thead class="table-sm table-success">
  <tr>
    <th style="width:30px;">SNO</th>

    <th style="width:100px; text-align:center;">Patent</th>
    <th style="width:300px; text-align:center;">Institution</th>
    <th style="width:100px; text-align:center;">Generation</th>
    <th style="width:100px; text-align:center;">Propose</th>
    </tr>
</thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['Designation'];
$dep = $row['Department'];
$type = $row['patent'];
$title = $row['institution'];
$from = $row['generation'];
$to = $row['propose'];
?>
<tbody>
<td><?php echo $s;?></td>

<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
<td style="width:200px; text-align:center;"><?php echo $from;?></td>
<td style="width:200px; text-align:center;"><?php echo $to;?></td>
</tbody>
<?php
$s++;
  }
}else{
  echo "";
}
  }
      ?>
</table></center>
<!--Research and Development-->
<center>

     <?php
     require('../models/dbcon.php');
     mysqli_set_charset($conn,"UTF8");
     if(isset($_POST['submit1'])){
       $sql = mysqli_query($conn,"select a.Department,a.Designation,i.type,i.staff_name,i.coname,i.title,i.from_date,i.to_date,i.year_aca,i.status,i.institution,i.revenue from staff_academics a,staff_development i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.from_date");
       if(mysqli_num_rows($sql) != null){ 
	   $s =1;?>
<b>Research and Development</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
    <thead class="table-sm table-success">
      <tr>
        <th style="width:30px;">SNO</th>
        <th style="width:100px; text-align:center;">Principle investigator</th>
        <th style="width:100px; text-align:center;">Co-invesgator</th>
        <th style="width:100px; text-align:center;">Title Of The Project</th>
        <th style="width:100px; text-align:center;">From Date</th>
        <th style="width:100px; text-align:center;">To Date</th>
        <th style="width:100px; text-align:center;">Academics Year</th>
        <th style="width:100px; text-align:center;">Status</th>
        <th style="width:100px; text-align:center;">Name Of The Institution</th>
        <th style="width:100px; text-align:center;">Revenue Generated</th>
        </tr>
   </thead>
<?php
while($row = mysqli_fetch_array($sql)){
  $name = $row['staff_name'];
  $des = $row['coname'];
  $dep = $row['Department'];
  $type = $row['Designation'];
  $title = $row['title'];
  $from = $row['from_date'];
  $to = $row['to_date'];
  $org = $row['year_aca'];
  $ins = $row['status'];
  $rev = $row['institution'];
  $reve = $row['revenue'];
?>

 <tbody>
   <td><?php echo $s;?></td>
   <td style="width:200px; text-align:center;"><?php echo $name;?></td>
   <td style="width:200px; text-align:center;"><?php echo $des;?></td>

   <td style="width:200px; text-align:center;"><?php echo $title;?></td>
   <td style="width:200px; text-align:center;"><?php echo $from;?></td>
   <td style="width:200px; text-align:center;"><?php echo $to;?></td>
   <td style="width:200px; text-align:center;"><?php echo $org;?></td>
   <td style="width:200px; text-align:center;"><?php echo $ins;?></td>
   <td style="width:200px; text-align:center;"><?php echo $rev;?></td>
   <td style="width:200px; text-align:center;"><?php echo $reve;?></td>
 </tbody>
 <?php
 $s++;
     }
   }else{
     echo "";
   }
 }if(isset($_POST['GetAll'])){
   $sql = mysqli_query($conn,"select a.Department,a.Designation,i.type,i.staff_name,i.coname,i.title,i.from_date,i.to_date,i.year_aca,i.status,i.institution,i.revenue from staff_academics a,staff_development i where a.staff_id = i.staff_id and i.staff_id='".$_POST['staffid']."' and ((i.from_date between '".$_POST['from']."' and '".$_POST['to']."') or (i.to_date between '".$_POST['from']."' and '".$_POST['to']."')) order by i.from_date");
   if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Research and Development</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
<thead class="table-sm table-success">
  <tr>
    <th style="width:30px;">SNO</th>
    <th style="width:100px; text-align:center;">Principle investigator</th>
    <th style="width:100px; text-align:center;">Co-invesgator</th>

    <th style="width:100px; text-align:center;">Title Of The Project</th>
    <th style="width:100px; text-align:center;">From Date</th>
    <th style="width:100px; text-align:center;">To Date</th>
    <th style="width:100px; text-align:center;">Academics Year</th>
    <th style="width:100px; text-align:center;">Status</th>
    <th style="width:100px; text-align:center;">Name Of The Institution</th>
    <th style="width:100px; text-align:center;">Revenue Generated</th>
    </tr>
</thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['coname'];
$dep = $row['Department'];
$type = $row['Designation'];
$title = $row['title'];
$from = $row['from_date'];
$to = $row['to_date'];
$org = $row['year_aca'];
$ins = $row['status'];
$rev = $row['institution'];
$reve = $row['revenue'];
?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $name;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>

<td style="width:200px; text-align:center;"><?php echo $title;?></td>
<td style="width:200px; text-align:center;"><?php echo $from;?></td>
<td style="width:200px; text-align:center;"><?php echo $to;?></td>
<td style="width:200px; text-align:center;"><?php echo $org;?></td>
<td style="width:200px; text-align:center;"><?php echo $ins;?></td>
<td style="width:200px; text-align:center;"><?php echo $rev;?></td>
<td style="width:200px; text-align:center;"><?php echo $reve;?></td>
</tbody>
<?php
$s++;
 }
}else{
 echo "";
}
 }
 ?>
   </table></center>
   <!--Online certificate-->
   <center>
    <?php
    require('../models/dbcon.php');
    mysqli_set_charset($conn,"UTF8");
    if(isset($_POST['submit1'])){
      $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.course_name,i.mark,i.organisation,i.data_of_exam from staff_academics a,staff_certificate i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' order by data_of_exam");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Online Certification Courses</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
     <thead class="table-sm table-success">
       <tr>
         <th style="width:30px;">SNO</th>

         <th style="width:100px; text-align:center;">Course name</th>
         <th style="width:300px; text-align:center;">Mark</th>
         <th style="width:300px; text-align:center;">Organisation</th>
         <th style="width:300px; text-align:center;">Date of exam</th>
         </tr>
    </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['course_name'];
$dep = $row['mark'];
$type = $row['organisation'];
$title = $row['data_of_exam'];
?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>
<td style="width:200px; text-align:center;"><?php echo $dep;?></td>
<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
</tbody>
<?php
$s++;
}
}
  }if(isset($_POST['GetAll'])){
    $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.course_name,i.mark,i.organisation,i.data_of_exam from staff_academics a,staff_certificate i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' and i.data_of_exam between '".$_POST['from']."' and '".$_POST['to']."' order by data_of_exam");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Online Certification Courses</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
   <thead class="table-sm table-success">
     <tr>
       <th style="width:30px;">SNO</th>

       <th style="width:100px; text-align:center;">Course name</th>
       <th style="width:300px; text-align:center;">Mark</th>
       <th style="width:300px; text-align:center;">Organisation</th>
       <th style="width:300px; text-align:center;">Date of exam</th>
       </tr>
  </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['course_name'];
$dep = $row['mark'];
$type = $row['organisation'];
$title = $row['data_of_exam'];
?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>
<td style="width:200px; text-align:center;"><?php echo $dep;?></td>
<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
</tbody>
<?php
$s++;
}
}
  }
    ?>
  </table></center>
  <!-- Competative exam  -->
  <center>
   <?php
   require('../models/dbcon.php');
   mysqli_set_charset($conn,"UTF8");
   if(isset($_POST['submit1'])){
     $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.exam_name,i.level,i.score,i.date_of_certificate from staff_academics a,staff_competitive i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' order by date_of_certificate");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Competitive Exam Details</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
    <thead class="table-sm table-success">
      <tr>
        <th style="width:30px;">SNO</th>

        <th style="width:100px; text-align:center;">Exam name</th>
        <th style="width:300px; text-align:center;">Level</th>
        <th style="width:300px; text-align:center;">Score</th>
        <th style="width:300px; text-align:center;">Date of Certificate</th>
        </tr>
   </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['exam_name'];
$dep = $row['level'];
$type = $row['score'];
$title = $row['date_of_certificate'];
?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>
<td style="width:200px; text-align:center;"><?php echo $dep;?></td>
<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
</tbody>
<?php
$s++;
}
}
 }if(isset($_POST['GetAll'])){
   $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.exam_name,i.level,i.score,i.date_of_certificate from staff_academics a,staff_competitive i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' and i.date_of_certificate between '".$_POST['from']."' and '".$_POST['to']."' order by date_of_certificate");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Competitive Exam Details</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
  <thead class="table-sm table-success">
    <tr>
      <th style="width:30px;">SNO</th>

      <th style="width:100px; text-align:center;">Exam name</th>
      <th style="width:300px; text-align:center;">Level</th>
      <th style="width:300px; text-align:center;">Score</th>
      <th style="width:300px; text-align:center;">Date of Certificate</th>
      </tr>
 </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['exam_name'];
$dep = $row['level'];
$type = $row['score'];
$title = $row['date_of_certificate'];
?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>
<td style="width:200px; text-align:center;"><?php echo $dep;?></td>
<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
</tbody>
<?php
$s++;
}
}
 }
   ?>
 </table></center>

  <!--Innovative Projects-->
  <center>
    <?php
    require('../models/dbcon.php');
	mysqli_set_charset($conn,"UTF8");
    if(isset($_POST['submit1'])){
      $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.project_title,i.description,i.status,i.from_date, i.to_date from staff_academics a,staff_innovative i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.from_date");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Innovative Project Details</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
     <thead class="table-sm table-success">
       <tr>
         <th style="width:30px;">SNO</th>

         <th style="width:100px; text-align:center;">Project title</th>
         <th style="width:300px; text-align:center;">Description</th>
         <th style="width:50px; text-align:center;">From</th>
       <th style="width:50px; text-align:center;">To</th>
         <th style="width:300px; text-align:center;">Status</th>
         </tr>
    </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$title = $row['project_title'];
$des = $row['description'];
$ifrom=$row['from_date'];
$ito=$row['to_date'];
$type = $row['status'];

?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>
<td style="width:100px; text-align:center;"><?php echo $ifrom;?></td>
<td style="width:100px; text-align:center;"><?php echo $ito;?></td>
<td style="width:200px; text-align:center;"><?php echo $type;?></td>
</tbody>
<?php
$s++;
}
}
  }if(isset($_POST['GetAll'])){
    $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.project_title,i.description,i.from_date,i.to_date,i.status from staff_academics a,staff_innovative i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' and ((i.from_date between '".$_POST['from']."' and '".$_POST['to']."') or (i.to_date between '".$_POST['from']."' and '".$_POST['to']."')) order by i.from_date");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Innovative Project Details</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
   <thead class="table-sm table-success">
     <tr>
       <th style="width:30px;">SNO</th>

       <th style="width:100px; text-align:center;">Project title</th>
       <th style="width:300px; text-align:center;">Description</th>
       <th style="width:100px; text-align:center;">From</th>
       <th style="width:100px; text-align:center;">To</th>
       <th style="width:100px; text-align:center;">Status</th>
       </tr>
  </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$title = $row['project_title'];
$des = $row['description'];
$ifrom=$row['from_date'];
$ito=$row['to_date'];
$type = $row['status'];

?>

<tbody>
<td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
<td style="width:200px; text-align:center;"><?php echo $des;?></td>
<td style="width:100px; text-align:center;"><?php echo $ifrom;?></td>
<td style="width:100px; text-align:center;"><?php echo $ito;?></td>
<td style="width:100px; text-align:center;"><?php echo $type;?></td>
</tbody>
<?php
$s++;
}
}
  }
    ?>
  </table></center>

   <!--Research Scholars-->
   <center>
     <?php
        require('../models/dbcon.php');
		mysqli_set_charset($conn,"UTF8");
        if(isset($_POST['submit1'])){
          $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
          if(mysqli_num_rows($sql) != null){
   $s =1;?>
   <b>Research Scholars</b><p>&nbsp;</p>
   <table class="table table-sm table-bordered">
       <thead class="table-sm table-success">
         <tr>
           <th style="width:30px;">SNO</th>
<th style="width:100px; text-align:center;">Scholar Id</th>
           <th style="width:100px; text-align:center;">University</th>
           <th style="width:100px; text-align:center;">Supervisor Name</th>

           <th style="width:100px; text-align:center;">Designation</th>
           <th style="width:100px; text-align:center;">Organisation</th>
           <th style="width:100px; text-align:center;">Status</th>
           </tr>
      </thead>
   <?php
   while($row = mysqli_fetch_array($sql)){
     $name = $row['staff_name'];
     $des = $row['Department'];
     $dep = $row['Designation'];
     $type = $row['university'];
     $title = $row['sup_name'];
     $from = $row['desgination'];
     $to = $row['organisation'];
     $org = $row['status'];
     $sup = $row['res_id'];
   ?>

    <tbody>
      <td><?php echo $s;?></td>
<td style="width:200px; text-align:center;"><?php echo $sup;?></td>
      <td style="width:200px; text-align:center;"><?php echo $type;?></td>
      <td style="width:200px; text-align:center;"><?php echo $title;?></td>

      <td style="width:200px; text-align:center;"><?php echo $from;?></td>
      <td style="width:200px; text-align:center;"><?php echo $to;?></td>
      <td style="width:200px; text-align:center;"><?php echo $org;?></td>
    </tbody>
    <?php
    $s++;
        }
      }else{
        echo "";
      }
    }if(isset($_POST['GetAll'])){
      $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.res_id,i.staff_name,i.university,i.sup_name,i.desgination,i.organisation,i.status from staff_academics a,staff_scholars i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
      if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Research Scholars</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
   <thead class="table-sm table-success">
     <tr>
       <th style="width:30px;">SNO</th>
    <th style="width:100px; text-align:center;">Scholar Id</th>
       <th style="width:100px; text-align:center;">University</th>
       <th style="width:100px; text-align:center;">Supervisor Name</th>

       <th style="width:100px; text-align:center;">Designation</th>
       <th style="width:100px; text-align:center;">Organisation</th>
       <th style="width:100px; text-align:center;">Status</th>
       </tr>
  </thead>
<?php
while($row = mysqli_fetch_array($sql)){
 $name = $row['staff_name'];
 $des = $row['Department'];
 $dep = $row['Designation'];
 $type = $row['university'];
 $title = $row['sup_name'];
 $from = $row['desgination'];
 $to = $row['organisation'];
 $org = $row['status'];
 $sup = $row['res_id'];
?>

<tbody>
  <td><?php echo $s;?></td>
    <td style="width:200px; text-align:center;"><?php echo $sup;?></td>
  <td style="width:200px; text-align:center;"><?php echo $type;?></td>
  <td style="width:200px; text-align:center;"><?php echo $title;?></td>

  <td style="width:200px; text-align:center;"><?php echo $from;?></td>
  <td style="width:200px; text-align:center;"><?php echo $to;?></td>
  <td style="width:200px; text-align:center;"><?php echo $org;?></td>
</tbody>
<?php
$s++;
    }
  }else{
    echo "";
  }
    }
    ?>
      </table></center>
    <!--Research Supervisor-->
    <center>

         <?php
         require('../models/dbcon.php');
		 mysqli_set_charset($conn,"UTF8");
         if(isset($_POST['submit1'])){
           $sql = mysqli_query($conn,"select a.Department,a.Designation,i.res_sup_id,i.staff_id,i.staff_name,i.supj,i.university,i.internal,i.external,i.scholar from staff_academics a,staff_supervisor i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
           if(mysqli_num_rows($sql) != null){
    $s =1;?>
    <b>Research Supervisor</b><p>&nbsp;</p>
    <table class="table table-sm table-bordered">
        <thead class="table-sm table-success">
          <tr>
            <th style="width:30px;">SNO</th>
            <th style="width:100px; text-align:center;">Superviosr ID</th>
            <th style="width:100px; text-align:center;">Superviosr/Joint Supervisor</th>
            <th style="width:100px; text-align:center;">University</th>
            <th style="width:100px; text-align:center;">Internal Scholars</th>
            <th style="width:100px; text-align:center;">External Scholars</th>
            <th style="width:100px; text-align:center;">Total Number of Scholars Completed Ph.D</th>
            </tr>
       </thead>
    <?php
    while($row = mysqli_fetch_array($sql)){
      $name = $row['staff_name'];
      $des = $row['Designation'];
      $dep = $row['Department'];
      $supid=$row['res_sup_id'];
      $suptype=$row['supj'];
      $type = $row['university'];
      $title = $row['internal'];
      $from = $row['external'];
      $to = $row['scholar'];
    ?>

     <tbody>
       <td><?php echo $s;?></td>
       <td style="width:200px; text-align:center;"><?php echo $supid;?></td>
       <td style="width:200px; text-align:center;"><?php echo $suptype;?></td>
       <td style="width:200px; text-align:center;"><?php echo $type;?></td>
       <td style="width:200px; text-align:center;"><?php echo $title;?></td>
       <td style="width:200px; text-align:center;"><?php echo $from;?></td>
       <td style="width:200px; text-align:center;"><?php echo $to;?></td>
     </tbody>
     <?php
     $s++;
         }
       }else{
         echo "";
       }
     }if(isset($_POST['GetAll'])){
       $sql = mysqli_query($conn,"select a.Department,a.Designation,i.res_sup_id,i.staff_id,i.staff_name,i.supj,i.university,i.internal,i.external,i.scholar from staff_academics a,staff_supervisor i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
       if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Research Supervisor</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
    <thead class="table-sm table-success">
      <tr>
        <th style="width:30px;">SNO</th>
        <th style="width:100px; text-align:center;">Superviosr ID</th>
        <th style="width:100px; text-align:center;">Superviosr/Joint Supervisor</th>
        <th style="width:100px; text-align:center;">University</th>
        <th style="width:100px; text-align:center;">Internal Scholars</th>
        <th style="width:100px; text-align:center;">External Scholars</th>
        <th style="width:100px; text-align:center;">Total Number of Scholars Completed Ph.D</th>
        </tr>
   </thead>
<?php
while($row = mysqli_fetch_array($sql)){
  $name = $row['staff_name'];
  $des = $row['Designation'];
  $dep = $row['Department'];
  $supid=$row['res_sup_id'];
  $suptype=$row['supj'];
  $type = $row['university'];
  $title = $row['internal'];
  $from = $row['external'];
  $to = $row['scholar'];
?>

 <tbody>
   <td><?php echo $s;?></td>
   <td style="width:200px; text-align:center;"><?php echo $supid;?></td>
   <td style="width:200px; text-align:center;"><?php echo $suptype;?></td>
   <td style="width:200px; text-align:center;"><?php echo $type;?></td>
   <td style="width:200px; text-align:center;"><?php echo $title;?></td>
   <td style="width:200px; text-align:center;"><?php echo $from;?></td>
   <td style="width:200px; text-align:center;"><?php echo $to;?></td>
 </tbody>
 <?php
 $s++;
     }
   }else{
     echo "";
   }
     }
     ?>
       </table></center>
       <!--Event organized-->
       <center>
         <?php
            require('../models/dbcon.php');
            mysqli_set_charset($conn,"UTF8");
            if(isset($_POST['submit1'])){
              $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_event_organized i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.from_date");
              if(mysqli_num_rows($sql) != null){
       $s =1;?>
       <b>Events Organized</b><p>&nbsp;</p>
       <table class="table table-sm table-bordered">
           <thead class="table-sm table-success">
             <tr>
               <th style="width:30px;">SNO</th>

               <th style="width:100px; text-align:center;">Type</th>
               <th style="width:100px; text-align:center;">Title</th>
               <th style="width:100px; text-align:center;">From Date</th>
               <th style="width:100px; text-align:center;">To Date</th>
               <th style="width:100px; text-align:center;">Organizer</th>
               <th style="width:100px; text-align:center;">Resource Person</th>
               <th style="width:100px; text-align:center;">No Of Beneficiaries</th>
               <th style="width:100px; text-align:center;">Sponsorship</th>
               <th style="width:100px; text-align:center;">Grants</th>
               </tr>
          </thead>
       <?php
       while($row = mysqli_fetch_array($sql)){
         $name = $row['staff_id'];
         $des = $row['Department'];
         $dep = $row['Designation'];
         $type = $row['type'];
         $title = $row['title'];
         $from = $row['from_date'];
         $to = $row['to_date'];
         $org = $row['organizer'];
         $res = $row['res_person'];
         $ben = $row['ben_person'];
         $spon = $row['sponsership'];
         $gra = $row['granted'];
       ?>
       <tbody>
          <td><?php echo $s;?></td>

          <td style="width:200px; text-align:center;"><?php echo $type;?></td>
          <td style="width:200px; text-align:center;"><?php echo $title;?></td>
          <td style="width:200px; text-align:center;"><?php echo $from;?></td>
          <td style="width:200px; text-align:center;"><?php echo $to;?></td>
          <td style="width:200px; text-align:center;"><?php echo $org;?></td>
          <td style="width:200px; text-align:center;"><?php echo $res;?></td>
          <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
          <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
          <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
        </tbody>
        <?php
        $s++;
            }
          }else{
            echo "";
          }
        }if(isset($_POST['GetAll'])){
          $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_event_organized i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by i.from_date");
          if(mysqli_num_rows($sql) != null){
   $s =1;?>
   <b>Events Organized</b><p>&nbsp;</p>
   <table class="table table-sm table-bordered">
       <thead class="table-sm table-success">
         <tr>
           <th style="width:30px;">SNO</th>

           <th style="width:100px; text-align:center;">Type</th>
           <th style="width:100px; text-align:center;">Title</th>
           <th style="width:100px; text-align:center;">From Date</th>
           <th style="width:100px; text-align:center;">To Date</th>
           <th style="width:100px; text-align:center;">Organizer</th>
           <th style="width:100px; text-align:center;">Resource Person</th>
           <th style="width:100px; text-align:center;">No Of Beneficiaries</th>
           <th style="width:100px; text-align:center;">Sponsorship</th>
           <th style="width:100px; text-align:center;">Grants</th>
           </tr>
      </thead>
   <?php
   while($row = mysqli_fetch_array($sql)){
     $name = $row['staff_id'];
     $des = $row['Department'];
     $dep = $row['Designation'];
     $type = $row['type'];
     $title = $row['title'];
     $from = $row['from_date'];
     $to = $row['to_date'];
     $org = $row['organizer'];
     $res = $row['res_person'];
     $ben = $row['ben_person'];
     $spon = $row['sponsership'];
     $gra = $row['granted'];
   ?>
   <tbody>
      <td><?php echo $s;?></td>

      <td style="width:200px; text-align:center;"><?php echo $type;?></td>
      <td style="width:200px; text-align:center;"><?php echo $title;?></td>
      <td style="width:200px; text-align:center;"><?php echo $from;?></td>
      <td style="width:200px; text-align:center;"><?php echo $to;?></td>
      <td style="width:200px; text-align:center;"><?php echo $org;?></td>
      <td style="width:200px; text-align:center;"><?php echo $res;?></td>
      <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
      <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
      <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
    </tbody>
    <?php
    $s++;
        }
      }else{
        echo "";
      }
        }
        ?>
      </table></center>
      <!--Club Activity-->
      <center>
        <?php
           require('../models/dbcon.php');
           mysqli_set_charset($conn,"UTF8");
           if(isset($_POST['submit1'])){
             $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.club,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' order by i.from_date");
             if(mysqli_num_rows($sql) != null){
      $s =1;?>
      <b>Club Activity</b><p>&nbsp;</p>
      <table class="table table-sm table-bordered">
          <thead class="table-sm table-success">
            <tr>
              <th style="width:30px;">SNO</th>
              <th style="width:100px; text-align:center;">Club Name</th>
              <th style="width:100px; text-align:center;">Type</th>
              <th style="width:100px; text-align:center;">Title</th>
              <th style="width:100px; text-align:center;">From Date</th>
              <th style="width:100px; text-align:center;">To Date</th>
              <th style="width:100px; text-align:center;">Organizer</th>
              <th style="width:100px; text-align:center;">Resource Person</th>
              <th style="width:100px; text-align:center;">No Of Beneficiaries</th>
              <th style="width:100px; text-align:center;">Sponsorship</th>
              <th style="width:100px; text-align:center;">Grants</th>
              </tr>
         </thead>
      <?php
      while($row = mysqli_fetch_array($sql)){
        $name = $row['staff_id'];
        $des = $row['Department'];
        $dep = $row['Designation'];
        $club = $row['club'];
        $type = $row['type'];
        $title = $row['title'];
        $from = $row['from_date'];
        $to = $row['to_date'];
        $org = $row['organizer'];
        $res = $row['res_person'];
        $ben = $row['ben_person'];
        $spon = $row['sponsership'];
        $gra = $row['granted'];
      ?>
      <tbody>
         <td><?php echo $s;?></td>
         <td style="width:200px; text-align:center;"><?php echo $club;?></td>
         <td style="width:200px; text-align:center;"><?php echo $type;?></td>
         <td style="width:200px; text-align:center;"><?php echo $title;?></td>
         <td style="width:200px; text-align:center;"><?php echo $from;?></td>
         <td style="width:200px; text-align:center;"><?php echo $to;?></td>
         <td style="width:200px; text-align:center;"><?php echo $org;?></td>
         <td style="width:200px; text-align:center;"><?php echo $res;?></td>
         <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
         <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
         <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
       </tbody>
       <?php
       $s++;
           }
         }else{
           echo "";
         }
       }if(isset($_POST['GetAll'])){
         $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_id,i.club,i.type,i.title,i.from_date,i.to_date,i.organizer,i.res_person,i.ben_person,i.sponsership,i.granted from staff_academics a,staff_club i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."' and to_date between '".$_POST['from']."' and '".$_POST['to']."' order by i.from_date");
         if(mysqli_num_rows($sql) != null){
  $s =1;?>
  <b>Club Activity</b><p>&nbsp;</p>
  <table class="table table-sm table-bordered">
      <thead class="table-sm table-success">
        <tr>
          <th style="width:30px;">SNO</th>
          <th style="width:100px; text-align:center;">Club Name</th>
          <th style="width:100px; text-align:center;">Type</th>
          <th style="width:100px; text-align:center;">Title</th>
          <th style="width:100px; text-align:center;">From Date</th>
          <th style="width:100px; text-align:center;">To Date</th>
          <th style="width:100px; text-align:center;">Organizer</th>
          <th style="width:100px; text-align:center;">Resource Person</th>
          <th style="width:100px; text-align:center;">No Of Beneficiaries</th>
          <th style="width:100px; text-align:center;">Sponsorship</th>
          <th style="width:100px; text-align:center;">Grants</th>
          </tr>
     </thead>
  <?php
  while($row = mysqli_fetch_array($sql)){
    $name = $row['staff_id'];
    $des = $row['Department'];
    $dep = $row['Designation'];
    $club = $row['club'];
    $type = $row['type'];
    $title = $row['title'];
    $from = $row['from_date'];
    $to = $row['to_date'];
    $org = $row['organizer'];
    $res = $row['res_person'];
    $ben = $row['ben_person'];
    $spon = $row['sponsership'];
    $gra = $row['granted'];
  ?>
  <tbody>
     <td><?php echo $s;?></td>
     <td style="width:200px; text-align:center;"><?php echo $club;?></td>
     <td style="width:200px; text-align:center;"><?php echo $type;?></td>
     <td style="width:200px; text-align:center;"><?php echo $title;?></td>
     <td style="width:200px; text-align:center;"><?php echo $from;?></td>
     <td style="width:200px; text-align:center;"><?php echo $to;?></td>
     <td style="width:200px; text-align:center;"><?php echo $org;?></td>
     <td style="width:200px; text-align:center;"><?php echo $res;?></td>
     <td style="width:200px; text-align:center;"><?php echo $ben;?></td>
     <td style="width:200px; text-align:center;"><?php echo $spon;?></td>
     <td style="width:200px; text-align:center;"><?php echo $gra;?></td>
   </tbody>
   <?php
   $s++;
       }
     }else{
       echo "";
     }
       }
       ?>
          </table></center>
   <!--Professional Details-->
   <center>
    <?php
    require('../models/dbcon.php');
    mysqli_set_charset($conn,"UTF8");
    if(isset($_POST['submit1'])){
      $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.membershipid,i.organization from staff_academics a,staff_member i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Professional Society Membership</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
     <thead class="table-sm table-success">
       <tr>
         <th style="width:30px;">SNO</th>

         <th style="width:100px; text-align:center;">MemberShipId</th>
         <th style="width:300px; text-align:center;">Organization</th>
         </tr>
    </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['Department'];
$dep = $row['Designation'];
$type = $row['membershipid'];
$title = $row['organization'];
?>

<tbody>
<td><?php echo $s;?></td>

<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
</tbody>
<?php
$s++;
}
}
  }if(isset($_POST['GetAll'])){
    $sql = mysqli_query($conn,"select a.Department,a.Designation,i.staff_name,i.membershipid,i.organization from staff_academics a,staff_member i where a.staff_id=i.staff_id and i.staff_id='".$_POST['staffid']."'");
if(mysqli_num_rows($sql) != null){
$s =1;?>
<b>Professional Society Membership</b><p>&nbsp;</p>
<table class="table table-sm table-bordered">
   <thead class="table-sm table-success">
     <tr>
       <th style="width:30px;">SNO</th>

       <th style="width:100px; text-align:center;">MemberShipId</th>
       <th style="width:300px; text-align:center;">Organization</th>
       </tr>
  </thead>
<?php
while($row = mysqli_fetch_array($sql)){
$name = $row['staff_name'];
$des = $row['Department'];
$dep = $row['Designation'];
$type = $row['membershipid'];
$title = $row['organization'];
?>

<tbody>
<td><?php echo $s;?></td>

<td style="width:200px; text-align:center;"><?php echo $type;?></td>
<td style="width:200px; text-align:center;"><?php echo $title;?></td>
</tbody>
<?php
$s++;
}
}
  }
    ?>
  </table></center><br><br><br>
  <table>
    <div class="row">
      <div class="col" style="text-align: left;">
        <b>{{ftext}}</b>
      </div>
      <div class="col" style="text-align: center;">
      <b>{{ftext1}}</b>
      </div>
      <div class="col" style="text-align: right;">
      <b>{{ftext2}}</b>
      </div>
    </div>
</table>
    </div>

<script>
    $(document).ready(function(){
        $("#print_button1").click(function(){
            var mode = 'iframe'; // popup
            var close = mode == "popup";
            var options = { mode : mode, popClose : close};
            $("div.wrapper").printArea( options );
        });
         $("#print_button2").click(function(){
            var mode = 'iframe'; // popup
            var close = mode == "popup";
            var options = { mode : mode, popClose : close};
            $("div.content").printArea( options );
        });
    });
    </script>
</body>
</html>
