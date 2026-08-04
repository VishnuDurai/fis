<?php require('../models/restrict.php');
header('Content-type: text/html; charset=utf-8');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Manage Profile &#183; SRECFIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
    <?php
    require('../models/dbcon.php');
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
  $pass = $row['password'];
}
 ?>
 <?php
 require('../models/dbcon.php');
 if(isset($_POST['update']))
 {
   $id = $_GET['staff_id'];
   $myPassword = $_POST['password'];
   $conpass = $_POST['ConfirmPassword'];
   if($myPassword == $conpass)
   {
   $sql = mysqli_query($conn,"update admin_dep set password='$myPassword' where staff_id = '$id'")
   or die(mysqli_error());
   header("location: setting.php");
   }else {
     echo "<script>alert('password not match..!')</script>";
   }
   }
  ?>
    <!-- <hr> -->
            <!-- <div class="container">
                <div class="row">
                    <div class="col-sm-4">
                        <h2>Public Avatar</h3>
                        <p>You can change your avatar here or remove the current avatar to revert</p>
                    </div>
                    <div class="col-sm-3">
                        <div class="text-center pro-img1">
                            <span id="image"></span>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <h4>Upload new avatar</h4>
                        <input type="file" name="file" id="file" class="form-control"><br>
                        <p>The maximum file size allowed is 200KB.</p>
                        <hr>
                        <span id="uploading_image"></span>
                    </div>
                </div> -->
        <hr>
        <div class="form-control">
<table>
<tr>
  <td>
    <table width="380" align="center" style="margin-left: 20px; float: left;"><br>
      <h3 style="margin-left: 20px; color: #682D87;">MY PROFILE</h3><hr><br>
      <tr>
            <td>Staff_id :</td>
            <td class="form-control"><?php echo $id; ?></td>&nbsp;&nbsp;&nbsp;
      </tr>
      <tr>
          <td>Password :</td>
          <td class="form-control"><?php echo $pass; ?></td>&nbsp;&nbsp;&nbsp;
      </tr>
    </table><hr><br>
<table>
  <CAPTION><h3 style="margin-left: 20px; color: #682D87;">UPDATE PROFILE</h3><hr></CAPTION>
<form action="setting.php?staff_id=<?php echo $_SESSION['staff_id']; ?>" method="post" onsubmit="return updateProfile(this)">
<table style="margin-left: 20px;">
    <tr><td>New Password :</td><td><input type="password" class="form-control" style="background-color:white; font-weight:bold;" name="password"  value="" required></td></tr>&nbsp;&nbsp;&nbsp;
    <tr><td>Confirm New Password :</td><td><input type="password" class="form-control" style="background-color:white; font-weight:bold;" name="ConfirmPassword"  value="" required></td></tr>&nbsp;&nbsp;&nbsp;
    <tr><td>&nbsp;</td><td><br><input type="submit" name="update" class="btn btn-outline-success" style="cursor: pointer;" value="Update Profile"></td></tr>
</table>
</form>
</table>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_home_data(){
                $.ajax({
                    url:'../controllers/fetch_user.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                            $('#id').append(data[c].staff_id);
                            $('#pass').append('<div data-name="password" class="password" data-type="text" data-pk="'+data[c].id+'">'+data[c].password+'</div>');
                        }
                     }
                  })
                };
            fetch_home_data();
            function fetch_img_data(){
                $.ajax({
                    url:'../controllers/fetch_img.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                    for(c=0;c<data.length;c++){
                        $('#image').append('<img src="../admin/upload/'+data[c].file+'" class="img-circle">')
                        }
                    }
                })
            };
            fetch_img_data();
            // Ediatable Bootstrap
            $('#pass').editable({
                container:'body',
                selector:'div.password',
                title:'Enter the new password:',
                url:'../controllers/update_user.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $(document).on('change','#file',function(){
                    var property = document.getElementById('file').files[0];
                    var image_name = property.name;
                    var image_extension = image_name.split('.').pop().toLowerCase();
                    if(jQuery.inArray(image_extension,['gif','png','jpg','jpeg']) == -1){
                        alert('Invalid Image File');
                    }else{
                        var image_size = property.size;
                        if(image_size > 2000000){
                            alert('Image File size is very big');
                        }else{
                            var form_data = new FormData();
                            form_data.append('file',property);
                            console.log(form_data);
                            $.ajax({
                                url:'../controllers/upload.php',
                                method:'POST',
                                data:form_data,
                                contentType:false,
                                cache:false,
                                processData:false,
                                beforeSend:function(){
                                    $('#uploading_image').html("<label class='text-success'>Image Uploading...</label>")
                                },
                                success:function(data){
                                    $('#uploading_image').html(data);
                                    location.reload();
                                }
                            })
                        }
                    }
                });
            });
        </script>
    </body>
</html>
