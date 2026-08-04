<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Home &#183; SRECFIS &#183; DEPARTMENT ADMIN</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> 
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/style.css">
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
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container">
            <div class="text-center">
                <h2>&nbsp;</h2>
            </div>
            <div class="jumbotron w3-animate-top">
            <div class="row">
            <!-- <div class="col-md-2"></div>
            <div class="col-md-4 pro-img">
                <div class="text-center pro-img1">
                <span id="image"></span>
                </div>
            </div> -->
            <div class="col-md-6">
                <div id="home_content"></div>
            </div>
        </div>
        </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_home_data(){
                $.ajax({
                    url:'../controllers/fetch_home.php',
                    method:'post',
                    success:function(data){
                        $('#home_content').html(data);
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
                        $('#image').append('<img src="../admin/upload/'+data[c].file+'" class="img-circle" alt="../views/img/user-logo.png" width="200" height="200">')
                        }
                    }
                })
            };
            fetch_img_data();
            });
        </script>
    </body>
</html>
