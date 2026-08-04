<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Competitive Exam | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_competitive.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Competitive Exam Details</h3>
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
                    <th>Exam Name</th>
                    <th>Level</th>
                    <th>Score</th>
                    <th>Date of Certificate</th>
                    <th>Action</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="competitive_data"></tbody>
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
                        <h2>Add New Competitive Details</h2>
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
                                    <label class="col-sm-3">Exam Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="exam_name" id="exam_name" class="form-control" placeholder="Exam Name">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Level</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="level" id="level" placeholder="level">
                                            <option>State Level</option>
                                            <option>National Level</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Score</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="score" id="score" class="form-control" placeholder="Score">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Date of Certificate</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="date_of_certificate" id="date_of_certificate" class="form-control">
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
                                <input type="submit" id="competitive_btn" name="competitive_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_competitive_data(){
                    $.ajax({
                        url:'../controllers/fetch_competitive.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="exam_name" class="exam_name" data-type="text" data-pk="'+data[c].id+'">'+data[c].exam_name+'</td>';
                                html_data += '<td data-name="level" class="level" data-type="select" data-pk="'+data[c].id+'">'+data[c].level+'</td>';
                                html_data += '<td data-name="score" class="score" data-type="text" data-pk="'+data[c].id+'">'+data[c].score+'</td>';
                                html_data += '<td data-name="date_of_certificate" class="date_of_certificate" data-type="date" data-pk="'+data[c].id+'">'+data[c].date_of_certificate+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#competitive_data').append(html_data);
                            }
                        }
                    })
                }
            fetch_competitive_data();
                // Editable Bootstrap
                $('#competitive_data').editable({
                        container:'body',
                        selector:'td.exam_name',
                        url:'../controllers/update_competitive.php',
                        title:'Exam name',
                        type:'POST',
                        validate:function(value){
                            if($.trim(value) == ''){
                                return 'This field is required';
                            }
                        }
                    });
                $('#competitive_data').editable({
                    container:'body',
                    selector:'td.level',
                    url:'../controllers/update_competitive.php',
                    title:'Level',
                    type:'POST',
                    source:[
                        {
                            value:'State Level',text:'State Level'
                        },{
                            value:'National Level',text:'National Level'
                        }
                    ],
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#competitive_data').editable({
                        container:'body',
                        selector:'td.score',
                        url:'../controllers/update_competitive.php',
                        title:'Score',
                        type:'POST',
                        validate:function(value){
                            if($.trim(value) == ''){
                                return 'This field is required';
                            }
                        }
                    });
                    $('#competitive_data').editable({
                        container:'body',
                        selector:'td.date_of_certificate',
                        url:'../controllers/update_competitive.php',
                        title:'Date of certificate',
                        type:'POST',
                        placement:'right',
                        validate:function(value){
                            if($.trim(value) == ''){
                                return 'This field is required';
                            }
                        }
                    });
            });
            // Delete Competitive
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_competitive.php',
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