<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Professional &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container">
        <div class="panel panel-default">
                <div class="section-title text-center">
                <h2>Professional Details</h2>
                </div>
                <div class="panel-body">
                <div class="row">
                <div class="col-sm-2"></div>
                <div class="col-sm-8">
                    <form class="form-horizontal" id="professional_data">
                        <div class="form-group has-error">
                            <label class="col-sm-3">Faculty Id</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="staff_id" id="staff_id" value="" readonly>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Faculty Name</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="staff_name" id="staff_name" value="" readonly>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Membership ID</label>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="membershipid" id="membershipid" placeholder="Membership Id">
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Organization</label>
                            <div class="col-sm-9">
                                <select type="text" name="organization" id="organization" class="form-control"></select>
                            </div>
                        </div>
                        <div class="text-center">
                        <button type="button" id="profession_btn" class="btn btn-primary">Update</button>
                        <p>&nbsp;</p>
                        <div class="return"></div>
                        </div>
                    </form>
                  </div>
                <div class="col-sm-2"></div>
                </div>
                </div>
            </div>
        </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_professional(){
                    $.ajax({
                        url:'../controllers/fetch_professional.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                $('select#organization').append('<option>'+data[c].pro_name+'</option>');
                            }
                        }
                    });
                  }
                fetch_professional();
                // Insert professional Details
                $('#profession_btn').click(function(){
                    $.ajax({
                        url:'../controllers/insert_professional.php',
                        method:'POST',
                        data:$('#professional_data').serialize(),
                        success:function(data){
                            if(data){
                                $('#membershipid').val('');
                                $('.return').fadeIn().html(data);
                                setTimeout(function(){
                                    $('.return').fadeOut('slow');
                                },3000);
                            }
                        }
                    })    
                });
            });
        </script>
    </body>
</html>