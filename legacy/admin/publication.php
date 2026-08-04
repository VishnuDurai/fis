<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id'])){
  header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html>
<head>
  <title>PUBLICATION</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
<style>

body{
background:url(images/2.jpg);
background-repeat:no-repeat;
background-size:100% 100%;
height:800px;
background-attachment:fixed;
}
</style>

</head>
<body bgcolor="tan"><br>
  <?php
$sql = "select * from staff_publication order by staff_id";

$result = mysql_query($sql);
$i = 0;
?>
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF PUBLICATION DETAILS</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <div id="form-control">
    <form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
      <div class="form-inline">
     <td><input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/><p>&nbsp;</p>&nbsp;&nbsp;&nbsp;&nbsp;
       <input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/>
    </td>
    <tr><td><button style="margin-left:48%;cursor:pointer;" class="btn btn-primary">Refresh</button></td></tr></div>
  </div></div>
<table class="table table-bordered table-hover table-striped" id="myTable" style="margin-top: 40px;">
<thead class="table-success"><tr>
  <th>Staff Id</th>
  <th>Staff name</th>
  <th>TypeOfPublicatino&nbsp;&nbsp;&nbsp;&nbsp;</th>
  <th>Type</th>
  <th>Title of article</th>
  <th>Name of the Journel/Conference</th>
  <th>Date of Conference</th>
  <th>Organizer(Conference)</th>
  <th>DOI</th>
  <th>ISSN/ISBN</th>
  <th>Month</th>
  <th>Volume</th>
  <th>PP</th>
  <th>Scopus Indexed</th>
  <th>Citations</th>
  <th>H-index</th>
  <th>Impact Factor</th>
  <th><center>Update</center></th>
  <th><center>Delete</center></th>
  <th><center>*</center></th></tr>
  </thead>
  <?php
  while($abc = mysql_fetch_array($result)){
    echo "<tr class='table-warning'>";
    echo '<input type="hidden" style="width:30px;" value="'.$abc['id'].'" name="id'.$i.'" readonly/>';
    echo "<td>";
    echo '<input type="number" style="width:60px; border:none; background-color:#FDF8E4;" value="'.$abc['staff_id'].'" name="ids'.$i.'" readonly/>';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="border:none; background-color:#FDF8E4;"  value="'.$abc['staff_name'].'" name="name'.$i.'" readonly/>';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:110px; border:none; background-color:#FDF8E4;" value="'.$abc['type_pub'].'" name="title'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['type'].'" name="coauthor'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:100px; border:none; background-color:#FDF8E4;" value="'.$abc['title'].'" name="publisher'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:100px; border:none; background-color:#FDF8E4;" value="'.$abc['journel'].'" name="edition'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['date_con'].'" name="isbn'.$i.'" />';
    echo "</td>";

    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['organizer'].'" name="org'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['doi'].'" name="do'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['isbn'].'" name="is'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="date" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['month_pub'].'" name="pub'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['volume_pub'].'" name="vol'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['pp'].'" name="p'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['index_pub'].'" name="ind'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['citations'].'" name="cit'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['hindex'].'" name="hin'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="text" style="width:150px; border:none; background-color:#FDF8E4;" value="'.$abc['impact'].'" name="imp'.$i.'" />';
    echo "</td>";
    echo "<td>";
    echo '<input type="submit" value="+" class="btn btn-sm btn-outline-warning" name="update'.$i.'"/>';
    if(isset($_POST['update'.$i.'']))
    {
      if(isset($_POST['check'.$i.'']))
      {
        $id = $_POST['id'.$i.''];
        $type = $_POST['title'.$i.''];
        $title = $_POST['coauthor'.$i.''];
        $from = $_POST['publisher'.$i.''];
        $to = $_POST['edition'.$i.''];
        $org = $_POST['isbn'.$i.''];

          $orga = $_POST['org'.$i.''];
          $doi = $_POST['do'.$i.''];
          $isbn = $_POST['is'.$i.''];
          $pub = $_POST['pub'.$i.''];
          $vol = $_POST['vol'.$i.''];
          $pp = $_POST['p'.$i.''];
          $index = $_POST['ind'.$i.''];
          $cit = $_POST['cit'.$i.''];
          $hin = $_POST['hin'.$i.''];
          $imp = $_POST['imp'.$i.''];

          $update = "update staff_publication set type_pub='$type',type='$title',title='$from',journel='$to',date_con='$org',organizer='$orga',doi='$doi',isbn='$isbn',month_pub='$pub ',volume_pub='$vol',pp='$pp',index_pub='$index',citations='$cit',hindex='$hin',impact='$imp' where id='$id' ";
          $qry = mysql_query($update);
          if(!$qry){echo "UPDATED FAILED";}else
          {

            header("location:publication.php");
  echo "<script type='text/javascript'>alert('Updated successfully !')</script>";
          }
        }
        else {echo "pls select checkbox";}
      }
      echo "</td>";

      echo "<td>";
      echo '<input type="submit" value="X" class="btn btn-sm btn-outline-danger" name="delete'.$i.'"/>';
      if(isset($_POST['delete'.$i.'']))
      {
          if(isset($_POST['check'.$i.''])){
            $id = $_POST['id'.$i.''];

            $delete = "delete from staff_publication where id='$id'";

            $qry = mysql_query($delete);
            if(!$qry){echo "Deletion failed";}else{
              header("location:publication.php");
              echo "<script type='text/javascript'>alert('deleted successfully !')</script>";
            }

          }
          else{echo "pls select checkbox";}
        }
        echo "</td>";

        echo "<td>";
        echo '<input type="checkbox" name="check'.$i.'" />';
        echo "</td>";

        echo "</tr>";
        $i++;
          }

  ?>
  </table>

  <hr>

</div>
</body>
</html>
<script>
function myFunction() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[0];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
<script>
function myFunction1() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput1");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[1];
    if (td) {
      if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}
</script>
