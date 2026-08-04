<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Researchscholars | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_scholars.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a> 
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Research Scholars Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead class="table-success">
                    <tr>
                    <th>Staff Id</th>
                    <th>Research Scholar ID</th>
                    <th>Staff name</th>
                    <th>University</th>
                    <th>Supervisor Name</th>
                    <th>Designation</th>
                    <th>Organisation</th>
                    <th>Status</th>
                    <th>Action</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="scholars_data"></tbody>
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
                        <h2>Add New Research Scholar Details</h2>
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
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Research Scholar ID</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="res_id" id="res_id" maxlength="13" value="">
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Scholar Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_name" id="staff_name" value="" readonly>
                                    </div>
                                </div>
                                
                                <div class="form-group has-success">
                                    <label class="col-sm-3">University</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="university" id="university" class="form-control" placeholder="University">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Supervisor Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="sup_name" id="sup_name" class="form-control" placeholder="Supervisor Name">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Desgination</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="desgination" id="desgination" class="form-control" placeholder="Desgination">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Organisation</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="organisation" id="organisation" class="form-control" placeholder="Organisation">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Status</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="status" id="status" placeholder="status">
                                        <option>Registered</option>
                                        <option>Provisionally Confirmed</option>
                                        <option>Submitted Synopsis</option>
                                        <option>Submitted Thesis</option>
                                        <option>Completed</option>
                                        </select>
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
                                <input type="submit" id="scholar_btn" name="scholar_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_home_data(){
                    $.ajax({
                        url:'../controllers/fetch_scholars.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data ='<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td data-name="res_id" class="res_id" data-type="text" data-pk="'+data[c].id+'">'+data[c].res_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="university" class="university" data-type="text" data-pk="'+data[c].id+'">'+data[c].university+'</td>';
                                html_data += '<td data-name="sup_name" class="sup_name" data-type="text" data-pk="'+data[c].id+'">'+data[c].sup_name+'</td>';
                                html_data += '<td data-name="desgination" class="desgination" data-type="text" data-pk="'+data[c].id+'">'+data[c].desgination+'</td>';
                                html_data += '<td data-name="organisation" class="organisation" data-type="text" data-pk="'+data[c].id+'">'+data[c].organisation+'</td>';
                                html_data += '<td data-name="status" class="status" data-type="select" data-pk="'+data[c].id+'">'+data[c].status+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#scholars_data').append(html_data);
                            }
                        }
                    })
                };
            fetch_home_data();
                // Editable Bootstrap
                $('#scholars_data').editable({
                container:'body',
                selector:'td.status',
                url:'../controllers/update_interaction.php',
                title:'Status',
                type:'POST',
                source:[
                    {
                        value:'Registered',text:'Registered'
                    },{
                        value:'Provisionally Confirmed',text:'Provisionally Confirmed'
                    },{
                        value:'Submitted Synopsis',text:'Submitted Synopsis'
                    },{
                        value:'Submitted Thesis',text:'Submitted Thesis'
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
                $('#scholars_data').editable({
                    container:'body',
                    selector:'td.organisation',
                    url:'../controllers/update_scholars.php',
                    title:'Organisation',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#scholars_data').editable({
                    container:'body',
                    selector:'td.desgination',
                    url:'../controllers/update_scholars.php',
                    title:'Desgination',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#scholars_data').editable({
                    container:'body',
                    selector:'td.sup_name',
                    url:'../controllers/update_scholars.php',
                    title:'Sup Name',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#scholars_data').editable({
                    container:'body',
                    selector:'td.res_id',
                    url:'../controllers/update_scholars.php',
                    title:'Res Id',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#scholars_data').editable({
                    container:'body',
                    selector:'td.university',
                    url:'../controllers/update_scholars.php',
                    title:'University',
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
                    url:'../controllers/delete_scholars.php',
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