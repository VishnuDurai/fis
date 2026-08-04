<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>IPR | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_ipr.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Intellectual Property Right</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead class="table-success">
                    <tr>
                    <th>Staff Id</th>
                    <th>Staff Name</th>
                    <th>Patent Name</th>
                    <th>Application No & Reference</th>
                    <th>Patent generation</th>
                    <th>Purpose</th>
                    <th>Action</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="ipr_data"></tbody>
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
                        <h2>Add New IPR Details</h2>
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
                                    <label class="col-sm-3">Patent Number</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="patent" id="patent" class="form-control" placeholder="Patent Number">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Application No & Reference</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="institution" id="institution" class="form-control" placeholder="Application No & Reference">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Date/Month/year of the Patent Generation</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="generation" id="generation" class="form-control" placeholder="Date/Month/year of the Patent Generation">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Purpose of IPR</label>
                                    <div class="col-sm-9">
                                        <textarea type="text" name="propose" id="propose" class="form-control" rows="3" placeholder="Purpose of IPR">
                                        </textarea>
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
                                <input type="submit" id="ipr_btn" name="ipr_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_ipr_data(){
                    $.ajax({
                        url:'../controllers/fetch_ipr.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="patent" class="patent" data-type="number" data-pk="'+data[c].id+'">'+data[c].patent+'</td>';
                                html_data += '<td data-name="institution" class="institution" data-type="text" data-pk="'+data[c].id+'">'+data[c].institution+'</td>';
                                html_data += '<td data-name="generation" class="generation" data-type="date" data-pk="'+data[c].id+'">'+data[c].generation+'</td>';
                                html_data += '<td data-name="propose" class="propose" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].propose+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                                $('#ipr_data').append(html_data);
                            }
                        }
                    })
                }
                fetch_ipr_data();
                // Editable Bootstrap
                $('#ipr_data').editable({
                    container:'body',
                    selector:'td.patent',
                    url:'../controllers/update_ipr.php',
                    title:'Patent',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#ipr_data').editable({
                    container:'body',
                    selector:'td.institution',
                    url:'../controllers/update_ipr.php',
                    title:'Institution',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#ipr_data').editable({
                    container:'body',
                    selector:'td.generation',
                    url:'../controllers/update_ipr.php',
                    title:'Generation',
                    placement:'right',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#ipr_data').editable({
                    container:'body',
                    selector:'td.propose',
                    url:'../controllers/update_ipr.php',
                    title:'Propose',
                    placement:'right',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            });
            // Delete ipr
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_ipr.php',
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