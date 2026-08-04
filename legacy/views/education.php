<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Education | Details &#183; SRECFIS</title>
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
                        <h3>Education Details</h3>
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
                        <th>Desgination</th>
                        <th>Department</th>
                        <th>Category</th>
                        <th>Specialization</th>
                        <th>Institute</th>
                        <th>Board</th>
                        <th>Year</th>
                        <th>Percentage</th>
                        <th>Action</th>
                        <th>X</th>
                        </tr>
                    </thead>
                    <tbody id="edu_data"></tbody>
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
                        <h2>Add New Education Details</h2>
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
                                    <label class="col-sm-3">Category</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="category" id="category" placeholder="category">

                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Specialization</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="specialization" id="specialization" placeholder="specialization">

                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Institute</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="institute" id="institute" class="form-control" placeholder="Institute">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Board/University</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="board" id="board" placeholder="type">

                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Year of passing</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="year" id="year" class="form-control" placeholder="Year of passing">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Percentage/CGPA</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="percentage" id="percentage" step="0.01" class="form-control" placeholder="Percentage/CGPA">
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
                                <input type="submit" id="edu_btn" name="edu_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_edu_data(){
                $.ajax({
                    url:'../controllers/fetch_edu.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                            var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                            html_data +='<td>'+data[c].staff_name+'</td>';
                            html_data += '<td data-name="Designation" class="Designation" data-type="text" data-pk="'+data[c].id+'">'+data[c].Designation+'</td>';
                            html_data += '<td data-name="Department" class="Department" data-type="text" data-pk="'+data[c].id+'">'+data[c].Department+'</td>';
                            html_data += '<td data-name="category" class="category" data-type="text" data-pk="'+data[c].id+'">'+data[c].category+'</td>';
                            html_data += '<td data-name="specialization" class="specialization" data-type="text" data-pk="'+data[c].id+'">'+data[c].specialization+'</td>';
                            html_data += '<td data-name="institute" class="institute" data-type="text" data-pk="'+data[c].id+'">'+data[c].institute+'</td>';
                            html_data += '<td data-name="board" class="board" data-type="text" data-pk="'+data[c].id+'">'+data[c].board+'</td>';
                            html_data += '<td data-name="year" class="year" data-type="text" data-pk="'+data[c].id+'">'+data[c].year+'</td>';
                            html_data += '<td data-name="percentage" class="percentage" data-type="text" data-pk="'+data[c].id+'">'+data[c].percentage+'</td>';
                            html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                            html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#edu_data').append(html_data);
                        }
                    }
                  })
                };
            fetch_edu_data();
            function fetch_category(){
                    $.ajax({
                        url:'../controllers/fetch_cat.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                $('select#category').append('<option>'+data[c].deg_name+'</option>');
                            }
                        }
                    });
                  }
                fetch_category();
                function fetch_specialization(){
                    $.ajax({
                        url:'../controllers/fetch_spe.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                $('select#specialization').append('<option>'+data[c].spe_name+'</option>');
                            }
                        }
                    });
                  }
                fetch_specialization();
                function fetch_board(){
                    $.ajax({
                        url:'../controllers/fetch_bor.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                $('select#board').append('<option>'+data[c].uni_name+'</option>');
                            }
                        }
                    });
                  }
                fetch_board();
            });

            // Delete education
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_edu.php',
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
