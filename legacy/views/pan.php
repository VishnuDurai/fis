<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Pan, Aadhar | Details &#183; SRECFIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css">
        <link rel="stylesheet" href="../css/normalize.min.css">
        <link rel="stylesheet" href="../css/animate.min.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container-fluid">
            <div class="row">
                    <div class="col-sm-2 text-center">
                        <button class="btn btn-primary" id="demo01" href="#animatedModal">Add New</button>
                    </div>
                    <div class="col-sm-7 text-center">
                        <h3>Pan, Aadhar Details</h3>
                    </div>
                    <div class="col-sm-3">
                    </div>
            </div>
            <p>&nbsp;</p>

            <div class="row">
                <div class="col-sm-6">
                    <div class="text-center">
                        <h4>Pan Card Details</h4>
                    </div>
                    <table class="table table-striped table-bordered">
                        <thead class="table-success">
                            <tr>
                                <th>Faculty Id</th>
                                <th>Faculty Name</th>
                                <th>Action</th>
                                <th>X</th>
                            </tr>
                        </thead>
                        <tbody id="pan_data"></tbody>
                    </table>
                </div>
                <div class="col-sm-6">
                <div class="text-center">
                    <h4>Aadhar Card Details</h4>
                </div>
                    <table class="table table-striped table-bordered">
                        <thead class="table-success">
                            <tr>
                                <th>Faculty Id</th>
                                <th>Faculty Name</th>
                                <th>Action</th>
                                <th>X</th>
                            </tr>
                        </thead>
                        <tbody id="aad_data"></tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="animatedModal">
            <div  id="btn-close-modal" class="close-animatedModal">
                Close <button class="btn btn-danger btn-sm">X</button>
            </div>
        <div class="modal-content">
            <div class="container">
                        <div class="panel panel-default">
                        <div class="section-title text-center">
                        <h2>Add New Pan, Aadhar Details</h2>
                        </div>
                        <div class="panel-body">
                        <div class="row">
                        <div class="col-sm-2"></div>
                        <div class="col-sm-8">
                            <form class="form-horizontal" action="../controllers/insert_data.php" role="form" name="sentMsg" method="post" novalidate="" enctype="multipart/form-data">
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Staff Id</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_id" id="staff_id" value="" readonly>
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Staff Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_name" id="staff_name" value="" readonly>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Pan Card Details</label>
                                    <div class="col-sm-6">
                                        <input type="file" name="myfile" id="myfile" class="form-control">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB<br>(jpg,png,pdf,doc,docx)</small>
                                    </div>
                                    <div class="col-sm-3">
                                    <input type="submit" id="pan_btn" name="pan_btn" value="Upload Pan Card" class="btn btn-primary"/>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Aadhar Card Details</label>
                                    <div class="col-sm-6">
                                        <input type="file" name="myfile1" id="myfile1" class="form-control">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB<br>(jpg,png,pdf,doc,docx)</small>
                                    </div>
                                    <div class="col-sm-3">
                                    <input type="submit" id="aad_btn" name="aad_btn" value="Upload Aadhar Card" class="btn btn-primary"/>
                                    </div>
                                </div>
                                <div class="return"></div>
                                </div>
                            </form>
                        </div>
                        <div class="col-sm-2"></div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/animatedModal.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_pan_data(){
                $.ajax({
                    url:'../controllers/fetch_pan.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                            var html_data1 = '<tr><td>'+data[c].staff_id+'</td>';
                            html_data1 += '<td>'+data[c].staff_name+'</td>'
                            html_data1 += '<td><a href="../admin/document/'+data[c].path1+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                            html_data1 += '<td><input type="button" onclick="confirmGetMessage1('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#pan_data').append(html_data1);
                        }
                    }
                  })
                };
                fetch_pan_data();
                function fetch_aad_data(){
                $.ajax({
                    url:'../controllers/fetch_aad.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                            var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                            html_data += '<td>'+data[c].staff_name+'</td>'
                            html_data += '<td><a href="../admin/document/'+data[c].path1+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                            html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#aad_data').append(html_data);
                        }
                    }
                  })
                };
                fetch_aad_data();
            });
            // Delete Pan
            function confirmGetMessage1(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_pan.php',
                    method:'POST',
                    data:{id:id},
                    success:function(data){
                    if(data=='One Record Deleted Successfull!'){
                        alert(data);
                        location.reload();
                        }
                    }
                });
                }
            else{
                alert("You clicked the cancel button");
                }
            }
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_aad.php',
                    method:'POST',
                    data:{id:id},
                    success:function(data){
                    if(data=='One Record Deleted Successfull!'){
                        alert(data);
                        location.reload();
                        }
                    }
                });
                }
            else{
                alert("You clicked the cancel button");
                }
            }
            // Animated Model popup
            $("#demo01").animatedModal({
                color:'#ecf0f1'
            });
        </script>
    </body>
</html>
