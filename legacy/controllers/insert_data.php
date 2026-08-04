<?php
// interaction_details
require('../models/dbcon.php');
    if(isset($_POST['interaction_btn'])){
        $id = $_POST['staff_id'];
        $names = $_POST['staff_name'];
        $type = $_POST['type'];
        $title = $_POST['title'];
        $date = date('d-m-y');
        $from_date = $_POST['from_date'];
        $to_date = $_POST['to_date'];
        $organizer = $_POST['organizer'];
        $file = rand(1000,100000)."-".$_FILES['file']['name'];
        $file_loc = $_FILES['file']['tmp_name'];
        $file_size = $_FILES['file']['size'];
        $file_type = $_FILES['file']['type'];
        $folder="../admin/document/";
        $new_size = $file_size/10000;
        $new_file_name = strtolower($file);
        $final_file=str_replace(' ','-',$new_file_name);
    if(move_uploaded_file($file_loc,$folder.$final_file))
     {
      $sql="INSERT INTO staff_interaction(staff_id,staff_name,type,title,from_date,to_date,organizer,file,type1,size,date) VALUES('$id','$names','$type','$title','$from_date','$to_date','$organizer','$final_file','$file_type','$new_size','$date')";
      mysqli_query($conn,$sql);
      ?>
      <script>
      alert('successfully uploaded');
            window.location.href='../views/interaction.php?success';
            </script>
      <?php
     }
     else
     {
      ?>
      <script>
      alert('Please uploading file');
            window.location.href='../views/interaction.php?fail';
            </script>
      <?php
     }
    }
// publication data
if(isset($_POST['publication_btn']))
{
$id = $_POST['staff_id'];
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
$web = $_POST['web_of_science'];
$citations = $_POST['citations'];
$hindex = $_POST['hindex'];
$impact = $_POST['impact'];
$organizer = $_POST['organizer'];
$file = rand(1000,100000)."-".$_FILES['file']['name'];
$file_loc = $_FILES['file']['tmp_name'];
$file_size = $_FILES['file']['size'];
$file_type = $_FILES['file']['type'];
$folder="../admin/document/";
$new_size = $file_size/10000;
$new_file_name = strtolower($file);
$final_file=str_replace(' ','-',$new_file_name);
if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_publication(staff_id,staff_name,type_pub,type,title,journel,date_con,organizer,doi,isbn,month_pub,volume_pub,pp,index_pub,web_of_science,citations,hindex,impact,file,type1,size) VALUES('$id','$staff_name','$type_pub','$type','$title','$journel','$date_con','$organizer','$doi','$isbn','$month_pub','$volume_pub','$pp','$index_pub','$web','$citations','$hindex','$impact','$final_file','$file_type','$new_size')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/publication.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please upload file');
        window.location.href='../views/publication.php?fail';
        </script>
  <?php
 }
}
// book published data
if(isset($_POST['bpublished_btn']))
{
	$id = $_POST['staff_id'];
	$names = $_POST['staff_name'];
	$title = $_POST['title'];
	$date = date('d-m-y');
	$coauthor = $_POST['coauthor'];
	$publisher =$_POST['publisher'];
	$edition =$_POST['edition'];
	$isbn = $_POST['isbn'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
    $file_loc = $_FILES['file']['tmp_name'];
    $file_size = $_FILES['file']['size'];
    $file_type = $_FILES['file']['type'];
	$dateofpublication = $_POST['dateofpublication'];
    $folder="../admin/document/";
    $new_size = $file_size/10000;
    $new_file_name = strtolower($file);
    $final_file=str_replace(' ','-',$new_file_name);
    if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_book_published(staff_id,staff_name,title,coauthor,publisher,edition,isbn,file,type,size,date,dateofpublication) VALUES('$id','$names','$title','$coauthor','$publisher','$edition','$isbn','$final_file','$file_type','$new_size','$date','$dateofpublication')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/bookpublished.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please uploading file');
        window.location.href='../views/bookpublished.php?fail';
        </script>
  <?php
 }
}
// resource person
if(isset($_POST['resource_btn'])){
	$id = $_POST['staff_id'];
	$names = $_POST['staff_name'];
	$type = $_POST['type'];
	$title = $_POST['title'];
	$acted = $_POST['actedas'];
	$date = date('d-m-y');
	$from_date = $_POST['from_date'];
	$to_date = $_POST['to_date'];
	$organizer = $_POST['organizer'];
	$ben = $_POST['ben'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_resource(staff_id,staff_name,type,title,actedas,from_date,to_date,organizer,ben,file,type1,size,date) VALUES('$id','$names','$type','$title','$acted','$from_date','$to_date','$organizer',$ben,'$final_file','$file_type','$new_size','$date')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/resource.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('error while uploading file');
        window.location.href='../views/resource.php?fail';
        </script>
  <?php
 }
}
// award data
if(isset($_POST['award_btn']))
{
	$id = $_POST['staff_id'];
	$names =$_POST['staff_name'];
	$awardname = $_POST['awardname'];
	$date = date('d-m-y');
	$awardby =$_POST['awardby'];
      $event = $_POST['event'];
      $awa_date = $_POST['awa_date'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_award(staff_id,staff_name,awardname,awardby,event,awa_date,file,type,size,date) VALUES('$id','$names','$awardname','$awardby','$event','$awa_date','$final_file','$file_type','$new_size','$date')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/award.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please uploading file');
        window.location.href='../views/award.php?fail';
        </script>
  <?php
 }
}
//funding data
if(isset($_POST['funding_btn']))
{
	$id = $_POST['staff_id'];
	$names = $_POST['staff_name'];
	$coname = $_POST['copiname'];
	$coid = $_POST['copiid'];
      $title = $_POST['title'];
      $faa = $_POST['fa'];
      $stat = $_POST['status'];
      $date = $_POST['date'];
      $amount = $_POST['amount'];
      $refer = $_POST['referenceno'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_funding(staff_id,staff_name,copiname,copiid,title,fa,status,date,amount,referenceno,file) VALUES('$id','$names','$coname','$coid','$title','$faa','$stat','$date','$amount','$refer','$final_file')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/funding.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please uploading file');
        window.location.href='../views/funding.php?fail';
        </script>
  <?php
 }
}
// ipr data
if(isset($_POST['ipr_btn']))
{
	$id = $_POST['staff_id'];
	$names =$_POST['staff_name'];
	$patent =$_POST['patent'];
	$date = date('d-m-y');
	$institution = $_POST['institution'];
	$generation =$_POST['generation'];
	$purpose =$_POST['propose'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_ipr (staff_id,staff_name,patent,institution,generation,propose,file,type,size,date)VALUES('$id','$names','$patent','$institution','$generation','$purpose','$final_file','$file_type','$new_size','$date')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/ipr.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please uploading file');
        window.location.href='../views/ipr.php?fail';
        </script>
  <?php
 }
}
// online certificate
if(isset($_POST['certificate_btn'])){
	$id = $_POST['staff_id'];
	$names = $_POST['staff_name'];
	$course = $_POST['course_name'];
	$mark = $_POST['mark'];
	$date = date('d-m-y');
	$organisation = $_POST['organisation'];
	$data_of_exam = $_POST['data_of_exam'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_certificate(staff_id,staff_name,course_name,mark,organisation,data_of_exam,file,type1,size,date) VALUES('$id','$names','$course','$mark','$organisation','$data_of_exam','$final_file','$file_type','$new_size','$date')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/certificate.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please uploading file');
        window.location.href='../views/certificate.php?fail';
        </script>
  <?php
 }
}
// Competitive data
if(isset($_POST['competitive_btn']))
{
	$id = $_POST['staff_id'];
	$names = $_POST['staff_name'];
	$title = $_POST['exam_name'];
	$date = date('d-m-y');
	$coauthor = $_POST['level'];
	$publisher =$_POST['score'];
	$edition =$_POST['date_of_certificate'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="insert into staff_competitive (staff_id,staff_name,exam_name,level,score,date_of_certificate,date,file) values ('$id','$names','$title','$coauthor','$publisher','$edition','$date','$final_file')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/competitive.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('Please uploading file');
        window.location.href='../views/competitive.php?fail';
        </script>
  <?php
 }
}
// innovative project
if(isset($_POST['innovative_btn']))
{
	$id = $_POST['staff_id'];
	$staff_name = $_POST['staff_name'];
	$date = date('d-m-y');
	$university = $_POST['project_title'];
      $supj = $_POST['description'];
      $from = $_POST['from_date'];
      $to = $_POST['to_date'];
	$internal = $_POST['status'];

$sql = mysqli_query($conn,"insert into staff_innovative (staff_id,staff_name,project_title,description,from_date,to_date,status,date) values ('$id','$staff_name','$university','$supj','$from','$to','$internal','$date')");

if($sql){?>
<script>
alert('successfully uploaded');
			window.location.href='../views/innovative.php?success';
			</script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('Please Uploading file');
			      window.location.href='../views/innovative.php?fail';
			      </script>
<?php
}
}
// Research Development
if(isset($_POST['development_btn'])){
      $type=$_POST['type'];
      $staff_name = $_POST['staff_name'];
      $coname = $_POST['coname'];
      $staff_id = $_POST['staff_id'];
      $date = date('d-m-y');
      $coid = $_POST['coid'];
      $title = $_POST['title'];
      $from =$_POST['from_date'];
      $to =$_POST['to_date'];
      $year = $_POST['year_aca'];
      $status =$_POST['status'];
      $institution =$_POST['institution'];
      $revenue =$_POST['revenue'];

      $sql = mysqli_query($conn,"insert into staff_development (type,staff_name,coname,staff_id,coid,title,from_date,to_date,year_aca,status,institution,revenue,date)
            values ('$type','$staff_name','$coname','$staff_id','$coid','$title','$from','$to','$year','$status','$institution','$revenue','$date')");
      if($sql){?>
            <script>
            alert('successfully uploaded');
            window.location.href='../views/development.php?success';
            </script>
      <?php
      }
      else
      {
      ?>
      <script>
      alert('Please upload file');
      window.location.href='../views/development.php?fail';
      </script>
            <?php
      }
      }
      // Research Scholar
      if(isset($_POST['scholar_btn']))
{
	$id = $_POST['staff_id'];
	$res_id = $_POST['res_id'];
	$staff_name = $_POST['staff_name'];
	$date = date('d-m-y');
	$university = $_POST['university'];
	$sup_name = $_POST['sup_name'];
	$desgination = $_POST['desgination'];
	$organisation = $_POST['organisation'];
	$status = $_POST['status'];
	$file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);
 if(move_uploaded_file($file_loc,$folder.$final_file)){

$sql = mysqli_query($conn,"insert into staff_scholars (staff_id,res_id,staff_name,university,sup_name,desgination,organisation,status,date,file)
	values ('$id','$res_id','$staff_name','$university','$sup_name','$desgination','$organisation','$status','$date','$final_file')");
?>
<script>
alert('successfully uploaded');
			window.location.href='../views/scholars.php?success';
			</script>
<?php
}
else
{
?>
<script>
alert('please uploading file');
      window.location.href='../views/scholars.php?fail';
      </script>
<?php
}
}
// Research Supervisor Data
if(isset($_POST['supervisor_btn']))
{
	$id = $_POST['staff_id'];
	$res_sup_id = $_POST['res_sup_id'];
	$staff_name = $_POST['staff_name'];
	$date = date('d-m-y');
	$university = $_POST['university'];
	$supj = $_POST['supj'];
	$internal = $_POST['internal'];
	$external = $_POST['external'];
	$scholar = $_POST['scholar'];

$sql = mysqli_query($conn,"insert into staff_supervisor (staff_id,res_sup_id,staff_name,supj,university,internal,external,scholar,date)
	values ('$id','$res_sup_id','$staff_name','$supj','$university','$internal','$external','$scholar','$date')");
if($sql){?>
<script>
alert('successfully uploaded');
			window.location.href='../views/supervisor.php?success';
			</script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('Please Uploading file');
			      window.location.href='../views/supervisor.php?fail';
			      </script>

<?php
}
}
//Professional Society membership
if(isset($_POST['profession_btn']))
{
	$id = $_POST['staff_id'];
	$staff_name = $_POST['staff_name'];
	$membership = $_POST['membershipid'];
	$organization = $_POST['organization'];

$sql = mysqli_query($conn,"insert into staff_member (staff_id,staff_name,membershipid,organization)
	values ('$id','$staff_name','$membership','$organization')");
if($sql){?>
<script>
alert('successfully uploaded');
			window.location.href='../views/professional1.php?success';
			</script>
			<?php
		}
		else
		{
			?>
			<script>
			alert('Please Uploading file');
			      window.location.href='../views/professional1.php?fail';
			      </script>
<?php
}
}
//Events organized
if(isset($_POST['event_btn']))
{
	$staff_id = $_POST['staff_id'];
	$type = $_POST['type'];
	$title = $_POST['title'];
	$date = date('d-m-y');
	$from_date = $_POST['from_date'];
	$to_date = $_POST['to_date'];
	$organizer = $_POST['organizer'];
	$res_person = $_POST['res_person'];
	$ben_person = $_POST['ben_person'];
	$sponsership = $_POST['sponsership'];
      $grant = $_POST['granted'];
      $file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);
 if(move_uploaded_file($file_loc,$folder.$final_file)){

$sql = mysqli_query($conn,"insert into staff_event_organized (staff_id,type,title,from_date,to_date,organizer,res_person,ben_person,sponsership,granted,date,file)
	values ('$staff_id','$type','$title','$from_date','$to_date','$organizer','$res_person','$ben_person','$sponsership','$grant','$date','$final_file')");
?>
	<script>
	alert('successfully uploaded');
				window.location.href='../views/eventorganized.php?success';
				</script>
<?php
}
else
{
?>
<script>
alert('Please uploading file');
      window.location.href='../views/eventorganized.php?fail';
      </script>
<?php
}
}

//club activity
if(isset($_POST['club_btn'])){
	$staff_id = $_POST['staff_id'];
      $club = $_POST['club'];
	$type = $_POST['type'];
	$title = $_POST['title'];
	$date = date('d-m-y');
	$from_date = $_POST['from_date'];
	$to_date = $_POST['to_date'];
	$organizer = $_POST['organizer'];
	$res_person = $_POST['res_person'];
	$ben_person = $_POST['ben_person'];
	$sponsership = $_POST['sponsership'];
      $grant = $_POST['granted'];
      $file = rand(1000,100000)."-".$_FILES['file']['name'];
      $file_loc = $_FILES['file']['tmp_name'];
      $file_size = $_FILES['file']['size'];
      $file_type = $_FILES['file']['type'];
      $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);
 if(move_uploaded_file($file_loc,$folder.$final_file)){

$sql = mysqli_query($conn,"insert into staff_club (staff_id,club,type,title,from_date,to_date,organizer,res_person,ben_person,sponsership,granted,date,file)
	values ('$staff_id','$club','$type','$title','$from_date','$to_date','$organizer','$res_person','$ben_person','$sponsership','$grant','$date','$final_file')");
?>
	<script>
  alert('successfully uploaded');
        window.location.href='../views/clubactivity.php?success';
        </script>
	<?php
}
else
{
	?>
	<script>
	alert('Please uploading file');
	      window.location.href='../views/clubactivity.php?fail';
	      </script>
	<?php
}
}
if(isset($_POST['edu_btn']))
{
  $id = $_POST['staff_id'];
  $category = $_POST['category'];
  $specialization = $_POST['specialization'];
  $institute = $_POST['institute'];
  $board = $_POST['board'];
  $year = $_POST['year'];
  $percentage = $_POST['percentage'];

 $file = rand(1000,100000)."-".$_FILES['file']['name'];
 $file_loc = $_FILES['file']['tmp_name'];
 $file_size = $_FILES['file']['size'];
 $file_type = $_FILES['file']['type'];
 $folder="../admin/document/";

 // new file size in KB
 $new_size = $file_size/10000;
 // new file size in KB

 // make file name in lower case
 $new_file_name = strtolower($file);
 // make file name in lower case

 $final_file=str_replace(' ','-',$new_file_name);

 if(move_uploaded_file($file_loc,$folder.$final_file))
 {
  $sql="INSERT INTO staff_edu(staff_id,category,specialization,institute,board,year,percentage,file,type,size) VALUES('$id','$category','$specialization','$institute','$board','$year','$percentage','$final_file','$file_type','$new_size')";
  mysqli_query($conn,$sql);
  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/education.php?success';
        </script>
  <?php
 }
 else
 {
  ?>
  <script>
  alert('please upload file');
        window.location.href='../views/education.php?fail';
        </script>
  <?php
 }
 }
 if(isset($_POST['pan_btn']))
                  	{
              $id = $_POST['staff_id'];
              $names = $_POST['staff_name'];

						$file = rand(1000,100000)."-".$_FILES['myfile']['name'];
						  $file_loc = $_FILES['myfile']['tmp_name'];
						 $file_size = $_FILES['myfile']['size'];
						 $file_type = $_FILES['myfile']['type'];
						 $folder="../admin/document/";
						 $new_size = $file_size/10000;
						 // new file size in KB

						 // make file name in lower case
						 $new_file_name = strtolower($file);
						 // make file name in lower case

						 $final_file=str_replace(' ','-',$new_file_name);

              if(move_uploaded_file($file_loc,$folder.$final_file))
              {
			$sql = mysqli_query($conn,"insert into staff_pan (staff_id,staff_name,path1) values ('$id','$names','$final_file')" );

                  ?>
  <script>
  alert('successfully uploaded');
        window.location.href='../views/pan.php?success';
        </script>
                  <?php
 }
 else
 {
  ?>
  <script>
  alert('please upload file');
        window.location.href='../views/pan.php?fail';
        </script>
  <?php

 }
}

if(isset($_POST['aad_btn'])){
      $id = $_POST['staff_id'];
      $staff_name= $_POST['staff_name'];
          $file = rand(1000,100000)."-".$_FILES['myfile1']['name'];
          $file_loc = $_FILES['myfile1']['tmp_name'];
     $file_size = $_FILES['myfile1']['size'];
     $file_type = $_FILES['myfile1']['type'];
     $folder="../admin/document/";
     $new_size = $file_size/10000;
     // new file size in KB

     // make file name in lower case
     $new_file_name = strtolower($file);
     // make file name in lower case

     $final_file=str_replace(' ','-',$new_file_name);
      if(move_uploaded_file($file_loc,$folder.$final_file)){
                $sql = mysqli_query($conn,"insert into staff_aadhar (staff_id,staff_name,path1) values ('$id','$staff_name','$final_file')");
                ?>
                <script>
                alert('successfully uploaded');
                      window.location.href='../views/pan.php?success';
                      </script>
                      <?php
 }
 else
 {
      ?>
      <script>
      alert('please upload file');
            window.location.href='../views/pan.php?fail';
            </script>
      <?php
      }
    }
?>