<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Innovation Project | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_innovative.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Innovation Project Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead>
                    <tr>
                    <th>Staff Id</th>
                    <th>Staff name</th>
                    <th>Project Title</th>
                    <th>Description of the Project</th>
                    <th>From Date</th>
                    <th>To Date</th>
                    <th>status</th>
                    
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="innovation_data"></tbody>
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
                        <h2>Add New Innovation Project Details</h2>
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
                                    <label class="col-sm-3">Project Title</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="project_title" id="project_title" class="form-control" placeholder="Project Title">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Description</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="description" id="description" class="form-control" placeholder="Description">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">From Date</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="from_date" id="from_date" class="form-control" placeholder="From Date">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">To Date</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="to_date" id="to_date" class="form-control" placeholder="To Date">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Status</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="status" id="status" placeholder="status">
                                            <option>Ongoing</option>
                                            <option>Completed</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="innovative_btn" name="innovative_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_innovation_data(){
                    $.ajax({
                        url:'../controllers/fetch_innovation.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="project_title" class="project_title" data-type="text" data-pk="'+data[c].id+'">'+data[c].project_title+'</td>';
                                html_data += '<td data-name="description" class="description" data-type="text" data-pk="'+data[c].id+'">'+data[c].description+'</td>';
                                html_data += '<td data-name="from_date" class="from_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].from_date+'</td>';
                                html_data += '<td data-name="to_date" class="to_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].to_date+'</td>';
                                html_data += '<td data-name="status" class="status" data-type="select" data-pk="'+data[c].id+'">'+data[c].status+'</td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#innovation_data').append(html_data); 
                            }
                        }
                    })
                };
                fetch_innovation_data();
                // Editable bootstrap 
                $('#innovation_data').editable({
                    container:'body',
                    selector:'td.from_date',
                    url:'../controllers/update_innovative.php',
                    title:'From Date',
                    type:'POST',
                    placement:'right',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#innovation_data').editable({
                    container:'body',
                    selector:'td.to_date',
                    url:'../controllers/update_innovative.php',
                    title:'To Date',
                    type:'POST',
                    placement:'right',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#innovation_data').editable({
                    container:'body',
                    selector:'td.status',
                    url:'../controllers/update_innovative.php',
                    title:'Status',
                    type:'POST',
                    source:[
                        {
                            value:'Ongoing',text:'Ongoing'
                        },{
                            value:'Completed',text:'Completed'
                        }
                    ],
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#innovation_data').editable({
                    container:'body',
                    selector:'td.project_title',
                    url:'../controllers/update_innovative.php',
                    title:'Project Title',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#innovation_data').editable({
                    container:'body',
                    selector:'td.description',
                    url:'../controllers/update_innovative.php',
                    title:'Description',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            });
            // Delete Innovation
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_innovative.php',
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