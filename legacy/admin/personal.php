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
  <title>PERSONAL</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<style>
.pad{
  padding: 7px;
}
body{
background:url(images/2.jpg);
background-repeat:no-repeat;
background-size:100% 100%;
height:800px;
background-attachment:fixed;
}
</style>
</head>
<body bgcolor="tan">
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id = "page">
<div id = "header">
</div>
<div class="container">
<center><?php include('navbar.php');?></center><hr>
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF PERSONAL INFORMATION</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <!--<div class="form-control">-->
    <div class="form-inline">
      <input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/>
   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
   <button class="btn btn-warning" style="cursor: pointer;" data-toggle="modal" data-target="#addData">New Entry</button>
   <a href="personal.php"><button type="button" style="margin-left: 30px; cursor: pointer;" class="btn btn-primary"> refresh </button></a>
   <br></center>
<!--</div>-->
</div>
      <div class="modal fade" id="addData" tabindex="-1" role="dialog" aria-labelledby="addLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addLabel">Insert new entry</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <form action="personal.php" method="post">
          <div class="modal-body">
            <div class="form-group">
               <input type="number" class="form-control" id="nm" name="staff_id"  placeholder="Enter Staff_Id" required><br>
               <input type="text" class="form-control" id="em" name="staff_name" placeholder="Enter Staff_name" required><br>
               <input type="date" class="form-control" id="em" name="dob" placeholder="Enter DateOfBirth" required><br>
               <select type="text" class="form-control" id="em" name="gender" placeholder="Enter Gender" required>
                 <option class="#">--------</option>
               <option class="male">Male</option>
               <option class="female">Female</option>
               </select><br>
               <textarea  rows='6' class="form-control col-lg" cols='50' name='address' placeholder="enter address" required></textarea><br>
                <input type="number" class="form-control" id="em" name="mobile" placeholder="Enter mobile number" required><br>
                <input type="email" class="form-control" id="em" name="email" placeholder="Enter email" required><br>
                <input type="text" class="form-control" id="em" name="pan" placeholder="Enter PAN No"><br>
                <input type="number" class="form-control" id="em" name="aadhar" placeholder="Enter Aadhar no"><br>
                <select type="text" class="form-control" id="em" name="type" required> <br>
                  <option class="#">---------</option>
                  <option class="teaching">Teaching</option>
                  <option class="non">Non Teaching</option>
                </select>
            </div>
            </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="submit" name="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
        </div>
      </div>
    </div>
</div>
<div class="pad">
<table class="table table-sm table-bordered table-hover table-striped" id="myTable" style="margin-top: 40px;">
  <thead class="table-success"><tr>
  <th>Staff Id</th>
  <th>Staff name</th>
  <th>DateOfBirth&nbsp;&nbsp;&nbsp;&nbsp;</th>
  <th>Gender</th>
  <th>Address</th>
  <th>Mobile</th>
  <th>Email</th>
  <th>Pan</th>
  <th>Aadhar</th>
  <th>Type</th>
  <th></th>
  <th></th>
  </tr>
  </thead>
  <?php
  //$res = mysql_query("select  ");
  $result = mysql_query("select * from staff_personal order by staff_id") or die ("There is no record".mysql_error());
while($row = mysql_fetch_array($result))
{
  $id = $row['id'];
  $staff_id = $row['staff_id'];
  $name = $row['staff_name'];
  $dob = $row['dob'];
  $gender = $row['gender'];
  $address = $row['address'];
  $mobile = $row['mobile'];
  $email = $row['email'];
  $pan = $row['pan'];
  $pan_path = $row['path1'];
  $aadhar = $row['aadhar'];
  $type = $row['type'];
  ?>
  <tbody>
 <tr class="table-warning">
  <td><?php echo $staff_id;?></td>
  <td><?php echo $name;?></td>
  <td><?php echo $dob; ?></td>
  <td><?php echo $gender; ?></td>
  <td><?php echo $address; ?></td>
  <td><?php echo $mobile; ?></td>
  <td><?php echo $email; ?></td>
  <td><?php echo $pan; ?></td>
  <td><?php echo $aadhar; ?></td>
  <td><?php echo $type; ?></td>
  <td><?php echo "<a href='modify_personal.php?id=$id&staff_id=$staff_id&staff_name=$name&dob=$dob&gender=$gender&address=$address&mobile=$mobile&email=$email&pan=$pan&aadhar=$aadhar&type=$type'>Modify</a>" ?> </td>
  <td><?php echo "<a href='delete.php?del=$row[id]'>Delete</a>"; ?></td>
  </tr>
  </tbody>
  <?php
  }
  ?>
  </table>
</div>
  <hr>
</div>
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
<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>

    <?php
    require('DB/dbcon.php');
    if(isset($_POST['submit']))
    {
  $id = $_POST['staff_id'];
  $name = $_POST['staff_name'];
  $dob = $_POST['dob'];
  $gender = $_POST['gender'];
  $address = $_POST['address'];
  $mobile = $_POST['mobile'];
  $email = $_POST['email'];
  $pan = $_POST['pan'];
  $aadhar = $_POST['aadhar'];
  $type = $_POST['type'];

  $sql = mysql_query("insert into staff_personal (staff_id,staff_name,dob,gender,address,mobile,email,pan,aadhar,type) values ('$id','$name','$dob','$gender','$address','$mobile','$email','$pan','$aadhar','$type')") or
  die(mysql_error());
  if($sql){?>
    <script>
    alert('successfully uploaded');
          window.location.href='personal.php?success';
          </script>
    <?php
  }
  else
  {
    ?>
    <script>
    alert('error while uploading file');
          window.location.href='personal.php?fail';
          </script>
    <?php
  }
}?>
  <?php
    require('DB/dbcon.php');
    if(isset($_POST['submit']))
    {
      $id = $_POST['staff_id'];
      $sql = mysql_query("insert into staff_user (staff_id,password) values ('$id','$id')")or die(mysql_error());
      if($sql){
        ?>
        <script>
        alert('successfully uploaded');
              window.location.href='personal.php?success';
              </script>
        <?php
      }
      else
      {
        ?>
        <script>
        alert('error while uploading file');
              window.location.href='personal.php?fail';
              </script>
      <?php
      }
      }
      ?>
