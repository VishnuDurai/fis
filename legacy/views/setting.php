<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Manage Profile &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
    <hr>
            <div class="container">
                <div class="row">
                    <div class="col-sm-4" color="white">
                        <h2>Public Avatar</h3>
                        <p>You can change your avatar here or remove the current avatar to revert</p>
                    </div>
                    <div class="col-sm-3" color="white">
                        <div class="text-center pro-img1">
                            <span id="image"></span>
                        </div>
                    </div>
                    <div class="col-sm-4" color="white">
                        <h4>Upload new avatar</h4>
                        <input type="file" name="file" id="file" class="form-control" color="red"><br>
                        <p>The maximum file size allowed is 200KB.</p>
                        <hr>
                        <span id="uploading_image"></span>
                    </div>
                </div>
        <hr>
                <div class="row">
                    <div class="col-sm-4" color="white">
                        <h3>Main Settings</h3>
                        <p>This information will appear on your profile.</p>
                    </div>
                    <div class="col-sm-8 color="white"">
                        <p>&nbsp;</p>
                        <div class="form-group">
                            <label for="Staff_id">Staff Id</label>
                            <div class="form-control">
                                <span id="id"></span>
                            </div>
                        </div>
                        <div class="form-group" color="white">
                            <label for="password">Password</label>
                            <div class="form-control">
                                <span id="pass"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
