<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>OnlineCertificate | Details &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css">
        <link rel="stylesheet" href="../css/normalize.min.css">
        <link rel="stylesheet" href="../css/animate.min.css">
        <link rel="stylesheet" href="../css/style.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-2 text-center">
                    <button class="btn btn-primary" id="demo01" href="#animatedModal">Add New</button>   
                    <a class="btn btn-success" href="excel_certificate.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Online Certificate Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered"> 
                <thead class="table-success">
                    <tr>
                    <th>Staff Id</th>
                    <th>Staff name</th>
                    <th>Course Name</th>
                    <th>Marks</th>
                    <th>Date Of Certificate</th>
                    <th>Organisation</th>
                    <th>Action</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="certificate_data"></tbody>
            </table>
        </div>
        <div id="animatedModal">
            <div  id="btn-close-modal" class="close-animatedModal"> 
                Close <button class="btn btn-danger btn-sm">X</button>
            </div>
        <div class="modal-content">
            <div class="container">
                        <div class="panel panel-default">
                        <div class="section-title text-center">
                        <h2>Add New Online Certificate Details</h2>
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
                                    <label class="col-sm-3">Course Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="course_name" id="course_name" class="form-control" placeholder="Course Name">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Marks</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="mark" id="mark" class="form-control" placeholder="Marks">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Date of Certificate</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="data_of_exam" id="data_of_exam" class="form-control">
                                    </div>
                                </div>
                                
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Organisation</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="organisation" id="organisation" class="form-control" placeholder="Organisation">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Document Name</label>
                                    <div class="col-sm-9">
                                        <input type="file" name="file" id="file" class="form-control">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB<br>(jpg,png,pdf,doc,docx)</small>
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="certificate_btn" name="certificate_btn" value="PROCEED" class="btn btn-primary"/>
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
            </div>
            </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/animatedModal.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_certificate_data(){
                    $.ajax({
                        url:'../controllers/fetch_certificate.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="course_name" class="course_name" data-type="text" data-pk="'+data[c].id+'">'+data[c].course_name+'</td>';
                                html_data += '<td data-name="mark" class="mark" data-type="number" data-pk="'+data[c].id+'">'+data[c].mark+'</td>';
                                html_data += '<td data-name="data_of_exam" class="data_of_exam" data-type="date" data-pk="'+data[c].id+'">'+data[c].data_of_exam+'</td>';
                                html_data += '<td data-name="organisation" class="organisation" data-type="text" data-pk="'+data[c].id+'">'+data[c].organisation+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                           $('#certificate_data').append(html_data);
                            }
                        }
                    })
                }
                fetch_certificate_data();
                // Editable bootstrap
                $('#certificate_data').editable({
                    container:'body',
                    selector:'td.course_name',
                    url:'../controllers/update_certificate.php',
                    title:'Course name',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#certificate_data').editable({
                    container:'body',
                    selector:'td.mark',
                    url:'../controllers/update_certificate.php',
                    title:'Mark',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#certificate_data').editable({
                    container:'body',
                    selector:'td.data_of_exam',
                    url:'../controllers/update_certificate.php',
                    title:'Date of exam',
                    placement:'right',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#certificate_data').editable({
                    container:'body',
                    selector:'td.organisation',
                    url:'../controllers/update_certificate.php',
                    title:'Organisation',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            });
            // Delete Interaction
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_certificate.php',
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