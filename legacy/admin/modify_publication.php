<?php
session_start();
require('DB/dbcon.php');
if(empty($_SESSION['staff_id']))
{
	header("location:access-denied.php");
}
?>
<!DOCTYPE html>
<html>
<head>
	<title>Publication</title>
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
<center><b><font style="color: #176281;" size="6">SREC IMS</font></b></center><br>
<div id="page">
	<div id="header">
	</div>
	<div class="container">
	<div style="color: #682D87;" class="news"><b><marquee behavior="alternate">Publication details</marquee></b></div>
	<form action=" " onsubmit="return registerValidate(this)" enctype="multipart/form-data" method="post"><hr>
  <div class="form-control"><br>
	<center><h3 style="color: #682D87;">Please Fill your Publication Details</h3></center><hr>
	<table align="center">
<tr><td>Staff Id</td>
  <td><input type="number" class="form-control col-lg-10" name="staff_id"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $staff_id = $_GET['staff_id'];
      echo $staff_id;
    }
    ?>"
   style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Staff Name</td>
<td><input type="text" class="form-control col-lg-10" name="staff_name"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $staff_name = $_GET['staff_name'];
    echo $staff_name;
  }
  ?>"
  style='background-color:white; font-weight:bold;' required ></td></tr>
<tr><td>Type of Publication</td>
  <td><input type="text" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $type_pub = $_GET['type_pub'];
      echo $type_pub;
    }
    ?>"
    style='background-color:white; font-weight:bold;' name="type_pub"></td></tr>
<tr><td>Type</td><td>
  <input type="text"
  value="<?php
  if(isset($_GET['id'])){
    $id = $_GET['id'];
    $type = $_GET['type'];
    echo $type;
  }
  ?>"
  class="form-control col-lg-10" style='background-color:white; font-weight:bold;' name="type">
</td></tr>
<tr><td>Title of article</td>
  <td>
    <input type="text" class="form-control" name="title"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $title= $_GET['title'];
      echo $title;
    }
    ?>"
     style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Name of the Journel/Conference</td>
  <td>
    <input type = "text" class="form-control" name="journel" value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $journel= $_GET['journel'];
      echo $journel;
    }
    ?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Date of Conference</td>
  <td><input type="date" name="date_con"  class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $date_con= $_GET['date_con'];
      echo $date_con;
    }
    ?>"
    style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>Organizer(Conference)</td>
  <td><input type="text" class="form-control col-lg-10"
    name="organizer"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $organizer= $_GET['organizer'];
      echo $organizer;
    }
    ?>"
    style='background-color:white; font-weight:bold;'></td></tr>
<tr><td>DOI</td>
  <td><input type="text" name="doi" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $doi= $_GET['doi'];
      echo $doi;
    }
    ?>"
    style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>ISSN/ISBN</td>
  <td><input type="number" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $isbn= $_GET['isbn'];
      echo $isbn;
    }
    ?>"
    name="isbn" style='background-color:white; font-weight:bold;' required></td></tr>
<tr><td>Month</td>
  <td><input type="text" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $month_pub= $_GET['month_pub'];
      echo $month_pub;
    }
    ?>"
    name="month_pub" style='background-color:white; font-weight:bold; ' required></td></tr>
<tr><td>Volume</td>
  <td><input type="number" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $volume_pub= $_GET['volume_pub'];
      echo $volume_pub;
    }
    ?>"
    name="volume_pub" style='background-color:white; font-weight:bold; ' required></td></tr>
<tr><td>PP</td>
  <td><input type="text" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $pp= $_GET['pp'];
      echo $pp;
    }
    ?>"
    name="pp" style='background-color:white; font-weight:bold; ' required></td></tr>
<tr><td>Scopus Indexed</td>
  <td><input type="text" class="form-control col-lg-10"
    value="
    <?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $index_pub= $_GET['index_pub'];
      echo $index_pub;
    }
    ?>"
    name="index_pub" style='background-color:white; font-weight:bold; ' required></td></tr>
<tr><td>Citations</td>
  <td><input type="number" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $citations= $_GET['citations'];
      echo $citations;
    }
    ?>"
    name="citations" style='background-color:white; font-weight:bold; ' required></td></tr>
<tr><td>H-index</td>
  <td><input type="number" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $hindex= $_GET['hindex'];
      echo $hindex;
    }
    ?>"
    name="hindex" style='background-color:white; font-weight:bold; ' required></td></tr>
<tr><td>Impact Factor</td>
  <td><input type="text" class="form-control col-lg-10"
    value="<?php
    if(isset($_GET['id'])){
      $id = $_GET['id'];
      $impact= $_GET['impact'];
      echo $impact;
    }
    ?>"
    name="impact" step="0.01" style='background-color:white; font-weight:bold;' required></td></tr>
		<tr><td>Document Name</td>
		<td><input type="text" class="form-control" name="file"
			value="<?php
			if(isset($_GET['id'])){
				$id = $_GET['id'];
				$file = $_GET['file'];
				echo $file;
			}
			?>"
			style='background-color:white; font-weight:bold;' required></td></tr>
			<tr><td><input class="btn btn-outline-primary" style="cursor: pointer; width: 300px;" type='file' name='file'></td>
				<td><input class="btn btn-outline-info" style="cursor: pointer;" type='submit' name='sub_file'></td>
			</tr>
<tr><td>&nbsp;</td><td>
  <br><input type="submit" class="btn btn-outline-success" style="cursor: pointer;" name="submit" value="Update"></td><td><br>
	<center><a href="publication_test.php"><button type="button" style="cursor: pointer;" class="btn btn-outline-primary">Back</button></center></td></tr>
</table><br>
</div>
<hr>
</form>
</div>
</div>
</body>
</html>
<?php
require('DB/dbcon.php');
if(isset($_GET['id'])){
  if(isset($_POST['submit'])){
      $id = $_GET['id'];
      $staff_id = $_POST['staff_id'];
      $staff_name = $_POST['staff_name'];
      $type_pub = $_POST['type_pub'];
      $type = $_POST['type'];
      $title = $_POST['title'];
      $journel = $_POST['journel'];
      $date_con = $_POST['date_con'];
      $organizer = $_POST['organizer'];
      $doi = $_POST['doi'];
      $isbn = $_POST['isbn'];
      $month_pub = $_POST['month_pub'];
      $volume_pub = $_POST['volume_pub'];
      $pp = $_POST['pp'];
      $index_pub = $_POST['index_pub'];
      $citations = $_POST['citations'];
      $hindex = $_POST['hindex'];
      $impact = $_POST['impact'];
      $organizer = $_POST['organizer'];
    $sql = "update staff_publication set type_pub='$type_pub',type='$type',title='$title',journel='$journel',
    date_con='$date_con',organizer='$organizer',doi='$doi',isbn='$isbn',month_pub='$month_pub',volume_pub='$volume_pub',
    pp='$pp',index_pub='$index_pub',citations='$citations',hindex='$hindex',impact='$impact',organizer='$organizer'
    where id='$id'";
if($result = mysql_query($sql)){
	?>
	<script>
  alert('successfully uploaded');
        window.location.href='publication_test.php?success';
        </script>
	<?php
}
else
{
	?>
	<script>
	alert('error while uploading file');
	      window.location.href='publication_test.php?fail';
	      </script>
	<?php
}
  }

}

?>
<?php
require('DB/dbcon.php');
if(isset($_GET['id'])){
	if(isset($_POST['sub_file'])){
		$file = rand(1000,100000)."-".$_FILES['file']['name'];
	  $file_loc = $_FILES['file']['tmp_name'];
	 $file_size = $_FILES['file']['size'];
	 $file_type = $_FILES['file']['type1'];
	 $folder="document/";

	 // new file size in KB
	 $new_size = $file_size/10000;
	 // new file size in KB

	 // make file name in lower case
	 $new_file_name = strtolower($file);
	 // make file name in lower case

	 $final_file=str_replace(' ','-',$new_file_name);

	 if(move_uploaded_file($file_loc,$folder.$final_file)){
		 $sql = mysql_query("update staff_publication set file='$final_file' where id = '$id'");
		?>
		<script>
	  alert('successfully uploaded');
	        window.location.href='publication_test.php?success';
	        </script>
					<?php
			   }
			   else
			   {
			    ?>
					<script>
				  alert('error while uploading file');
				        window.location.href='publication_test.php?fail';
				        </script>
				  <?php
				 }
				}
			}
				?>
