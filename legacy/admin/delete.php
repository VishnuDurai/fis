<?php

require ('DB/dbcon.php');


if(isset($_GET['del']))
{
	$id = $_GET['del'];
	$sql = "delete from staff_personal where id='$id'";
	$result = mysql_query($sql) or die('Failed'.mysql_error());
if($result)
{?>
	<script>
	alert('successfully Deleted');
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
