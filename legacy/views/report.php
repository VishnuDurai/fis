<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Client Report &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> 
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/style.css">
        <style>
        .w3-hover-red{
            transition: 0.6s;
        }
        .w3-hover-black{
            transition: 0.6s;
        }
        </style>
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container">
            <div class="panel panel-default w3-animate-top">
            <div class="section-title text-center w3-animate-right">
                <h2>Individual Staff List</h2>
            </div>
            <div class="panel-body">
          <form action="fetch_report.php" class="form-horizontal w3-animate-left" method="post">
              <div class="form-group">
                  <label for="" class="col-sm-3">Staff Id</label>
                  <div class="col-sm-7">
                      <input type="text" class="form-control" value="" name="staffid" id="staff_id" readonly>
                      <input type="submit" class="btn btn-info w3-hover-red" style="cursor:pointer;" name="submit1" value="Staff Report">
                  </div>
              </div>
              <div class="form-group">
                  <label for="" class="col-sm-3">From Date</label>
                  <div class="col-sm-7">
                      <input type="date" class="form-control" value="" name="from" id="from">
                  </div>
              </div>
              <div class="form-group">
                  <label for="" class="col-sm-3">To Date</label>
                  <div class="col-sm-7">
                      <input type="date" class="form-control" value="" name="to" id="to">
                  </div>
              </div>
              <div class="text-center">
                  <input type="submit" class="btn btn-primary w3-hover-black" name="GetAll" id="report_btn" value="Get Report">
              </div>
            </form>
         </div>
    </div>
</div>
<hr>

        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/script.js"></script>
        <!-- <script>
            $('#report_btn').click(function(){
                var id = $('#staff_id').val();
                var from = $('#from').val();
                var to = $('#to').val();
               if(id){

               }if(from && to){

               }
            });
        </script> -->
    </body>
    <body style="background:url(2.jpg); background-repeat:no-repeat;background-size:100% 100%;height:800px;background-attachment:fixed">
</html>
