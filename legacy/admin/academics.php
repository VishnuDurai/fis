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
  <title>academics</title>
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
<style>
body{
background:url(images/2.jpg);
background-repeat:no-repeat;
background-size:100% 100%;
height:800px;
background-attachment:fixed;
}
.pad{
  padding: 7px;
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
<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">STAFF ACADEMICS INFORMATION</marquee></b></div>
 <center><h3></h3></center>
  <hr>
  <!--<div class="form-control">-->
<div class="form-inline">
  <input type="text" id="myInput" class="form-control" onkeyup="myFunction()" placeholder="Search Staff ID" style='background-color:white; font-weight:bold; width: 200px;'/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

    <input type="text" id="myInput1" class="form-control" onkeyup="myFunction1()" placeholder="Search Staff name" style='background-color:white; font-weight:bold; width: 200px;'/><a>&nbsp;</a>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="text" id="myInput2" class="form-control" onkeyup="myFunction2()" placeholder="Search Department" style='background-color:white; font-weight:bold; width: 200px;'/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <button class="btn btn-warning" style="cursor: pointer;" data-toggle="modal" data-target="#addData">New Entry</button>
      <a href="academics.php"><button type="button" style="margin-left: 30px; cursor: pointer;"
      class="btn btn-primary"> Refresh </button></a></div>
<!--</div>-->
  <div class="modal fade" id="addData" tabindex="-1" role="dialog" aria-labelledby="addLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addLabel">Insert new entry</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <form action="academics.php" method="post" enctype="multipart/form-data">
          <div class="modal-body">
            <div class="form-group">
               <input type="number" class="form-control" id="nm" name="staff_id"  placeholder="Enter Staff_Id" required><br>
               <input type="text" class="form-control" id="em" name="staff_name" placeholder="Enter Staff_name" required><br>
               <input type="date" class="form-control" id="em" name="Date_of_joining" placeholder="Enter Date_of_joining" required><br>
               <select type="text" class="form-control" id="em" name="Department" placeholder="select Department"  required>
                    <option class="eng">English</option>
                    <option class="mat">Mathematics</option>
                    <option class="phy">Physics</option>
                    <option class="che">Chemistry</option>
                    <option class="cse">Computer Science And Engineering</option>
                    <option class="aero">Aeronautical Engineering</option>
                    <option class="it"> Information Technology</option>
                    <option class="civ">Civil Engineering</option>
                    <option class="mec">Mechanical Engineering</option>
                    <option class="eee">Electrical And Electronics Engineering</option>
                    <option class="ece">Electronics And Communication Engineering</option>
                    <option class="eie">Electronics And Instrumentation Engineering</option>
                    <option class="bio">Biomedical Engineering</option>
		    <option class="rae">Robotics And Automation Engineering</option>
		    <option class="ai">Artificial Intelligence And Data Science</option>
                    <option class="nano"> Nano Science And Technology</option>
                    <option class="mba">Master Of Business Administration</option>
                    <option class="bok">BookDepot</option>
                    <option class="in">Industry Interface</option>
                    <option class="cme">Computer Maintenance Cell</option>
                    <option class="pc">Placement Cell</option>
                    <option class="co">Controller Office</option>
                    <option class="lib">Library</option>
                    <option class="pe">Physical Education</option>
                    <option class="of">Office</option>
                    <option class="sf">Site Staff</option>
                    <option class="al">Alumini Office</option>
                    <option class="tr">Transport</option>
               </select><br>
                <select type="text" class="form-control" id="em" name="Designation" placeholder="Enter Designation" required>
                  <option class="hod">Professor and HOD</option>
                  <option class="prof">Professor</option>
                  <option class="dean">Dean</option>
                  <option class="asso">Associate Professor</option>
                  <option class="srasso">Assistant Professor ( Sr.Grade)</option>
                  <option class="og">Assistant Professor ( OG)</option>
                  <option class="lec">Lecturer</option>
                  <option class="pla">Placement Co Ordinator</option>
                  <option class="seniadm">Senior System Administrator</option>
                  <option class="adm">System Administrator</option>
                  <option class="libassi">Asst Librarian</option>
                  <option class="tec">Technician</option>
                  <option class="lab">Lab Assistant</option>
                  <option class="seniassi">Senior Assistant</option>
                  <option class="junassi">Junior Assistant</option>
                  <option class="assin">Assistant</option>
                  <option class="skl">Skilled Assistant</option>
                  <option class="sel">Selection Grade Assistant</option>
                  <option class="ins">Instructor</option>
                  <option class="pro">Programmer</option>
                  <option class="phyl">Physical Director</option>
                  <option class="mas">Marker</option>
                  <option class="clerk">Clerk</option>
                  <option class="tec">Technician</option>
                  <option class="acc">Accountant</option>
                  <option class="acco">Accounts Officer</option>
                  <option class="tele">Telephone Operator</option>
                  <option class="at">Attender</option>
                  <option class="eng">Engineer IT Systems</option>
                  <option class="sen">Senior Instructor</option>
                  <option class="ins">Instructor</option>
                  <option class="shop">Store Keeper</option>
                  <option class="manhome">Manager Housing Keeping</option>
                  <option class="est">Estate Officer</option>
                  <option class="ly">Iyer</option>
                  <option class="gen">Genset Operator</option>
                  <option class="elec">Electrician</option>
                  <option class="pump">Plumber</option>
                  <option class="car">Carpenter</option>
                  <option class="dri">Driver</option>
                </select><br>
                <select type="text" class="form-control" id="em" name="Qualification" placeholder="Enter Qualification">
                  <option class="me">ME</option>
                  <option class="phd">Phd</option>
                  <option class="mphil">Mphil</option>
                </select><br>
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
<div class="pan">
<table class="table table-sm table-bordered table-striped table-hover" id="myTable" style="  margin-top: 40px;">

  <thead class="table-success"><tr>
  <th>Staff Id</th>
  <th>Staff name</th>
  <th>Date Of Joining&nbsp;&nbsp;&nbsp;&nbsp;</th>
  <th>Designation</th>
  <th>Department</th>
  <th>Qualification</th>
  <th>Area Of Specialization</th>
  <th>Title of Thesis</th>
  <th>Appointment Order</th>
  <th>Joining Letter</th>
  <th>CA/Promotion Order</th>
  <th></th>
  <th></th></tr>
  </thead>
  <?php
  $result = mysql_query("select * from staff_academics order by staff_id") or die ("There is no record".mysql_error());
  if($result){
    header("location:academics.php");
}
while($row = mysql_fetch_array($result))
{
  $ids = $row['id'];
  $id = $row['staff_id'];
  $name = $row['staff_name'];
  $dob = $row['Date_of_joining'];
  $gender = $row['Designation'];
  $address = $row['Department'];
  $mobile = $row['Qualification'];
  $email = $row['area_of_special'];
  $pan = $row['title_of_thesis'];
  $file1 = $row['file1'];
  $file2 = $row['file2'];
  $file3 = $row['file3'];
 ?>
  <tbody>
 <tr class="table-warning">
  <td><?php echo $id;?></td>
  <td><?php echo $name;?></td>
  <td><?php echo $dob; ?></td>
  <td><?php echo $gender; ?></td>
  <td><?php echo $address; ?></td>
  <td><?php echo $mobile; ?></td>
  <td><?php echo $email; ?></td>
  <td><?php echo $pan; ?></td>
  <td><a href="document/<?php echo $row['file1']; ?>" target="_blank">View</a></td>
  <td><a href="document/<?php echo $row['file2']; ?>" target="_blank">View</a></td>
  <td><a href="document/<?php echo $row['file3']; ?>" target="_blank">View</a></td>
  <td><?php echo "<a href='modify_academics.php?id=$ids&staff_id=$id&staff_name=$name&Date_of_joining=$dob&Department=$gender&Designation=$address&Qualification=$mobile&area_of_special=$email&title_of_thesis=$pan&file1=$file1&file2=$file2&file3=$file3' >Modify</a>" ?> </td>
  <td><?php echo "<a href='academics.php?del=$row[id]'>Delete</a>"; ?></td>
  </tr>
  </tbody>
  <?php } ?>
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
<script>
function myFunction2() {

  var input, filter, table, tr, td, i;
  input = document.getElementById("myInput2");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    td = tr[i].getElementsByTagName("td")[4];
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
  if(isset($_POST['submit'])){
  $id = $_POST['staff_id'];
  $name = $_POST['staff_name'];
  $dob = $_POST['Date_of_joining'];
  $gender = $_POST['Department'];
  $address = $_POST['Designation'];
  $mobile = $_POST['Qualification'];


  $sql = mysql_query("insert into staff_academics (staff_id,staff_name,Date_of_joining,Department,Designation,Qualification) values ('$id','$name','$dob','$gender','$address','$mobile')") or die(mysql_error());
if($sql){?>
  <script>
  alert('successfully uploaded');
        window.location.href='academics.php?success';
        </script>
  <?php
}
else
{
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='academics.php?fail';
        </script>
  <?php
}
}
?>
<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_academics where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{?>
  <script>
  alert('successfully Deleted');
        window.location.href='academics.php?success';
        </script>
  <?php
}
else
{
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='academics.php?fail';
        </script>
	<?php
}

}
?>
