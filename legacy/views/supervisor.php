<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Research Supervisor | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_supervisor.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>  
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Research Supervisor Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead class="table-success">
                    <tr>
                    <th>Staff Id</th>
                    <th>Research Supervisor ID</th>
                    <th>Supervisor Name</th>
                    <th>Supervisor/Joint supervisor</th>
                    <th>University</th>
                    <th>No of Internal Research Scholars</th>
                    <th>No of External Research Scholars</th>
                    <th>No of Completed Scholars</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="supervisor_data"></tbody>
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
                        <h2>Add New Research Supervisor Details</h2>
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
                                    <label class="col-sm-3">Research Supervisor ID</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="res_sup_id" id="res_sup_id" value="" placeholder="Research Supervisor ID">
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Supervisor Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_name" id="staff_name" value="" readonly>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Supervisor/Joint Supervisor</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="supj" id="supj" placeholder="type">
                                            <option>Supervisor</option>
                                            <option>Joint Supervisor</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">University</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="university" id="university" class="form-control" placeholder="University">
                                    </div>
                                </div>
                                
                                <div class="form-group has-success">
                                    <label class="col-sm-3">No of Internal Research Scholars</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="internal" id="internal" class="form-control" placeholder="No of Internal Research Scholars">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">No of External Research Scholars</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="external" id="external" class="form-control" placeholder="No of External Research Scholars">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">No of Scholars Completed PHD</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="scholar" id="scholar" class="form-control" placeholder="No of External Research Scholars">
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="supervisor_btn" name="supervisor_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_supervisor_data(){
                $.ajax({
                    url:'../controllers/fetch_supervisor.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                       for(c=0;c<data.length;c++){
                           var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                           html_data += '<td data-name="res_sup_id" class="res_sup_id" data-type="text" data-pk="'+data[c].id+'">'+data[c].res_sup_id+'</td>';
                           html_data += '<td>'+data[c].staff_name+'</td>';
                           html_data += '<td data-name="supj" class="supj" data-type="select" data-pk="'+data[c].id+'">'+data[c].supj+'</td>';
                           html_data += '<td data-name="university" class="university" data-type="text" data-pk="'+data[c].id+'">'+data[c].university+'</td>';
                           html_data += '<td data-name="internal" class="internal" data-type="number" data-pk="'+data[c].id+'">'+data[c].internal+'</td>';
                           html_data += '<td data-name="external" class="external" data-type="number" data-pk="'+data[c].id+'">'+data[c].external+'</td>';
                           html_data += '<td data-name="scholar" class="scholar" data-type="number" data-pk="'+data[c].id+'">'+data[c].scholar+'</td>';
                           html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                        $('#supervisor_data').append(html_data);
                       }
                     }
                  })
                };
                fetch_supervisor_data();
                // Editable Bootstrap
                $('#supervisor_data').editable({
                    container:'body',
                    selector:'td.scholar',
                    url:'../controllers/update_supervisor.php',
                    title:'Scholar',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#supervisor_data').editable({
                    container:'body',
                    selector:'td.external',
                    url:'../controllers/update_supervisor.php',
                    title:'External',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#supervisor_data').editable({
                    container:'body',
                    selector:'td.internal',
                    url:'../controllers/update_supervisor.php',
                    title:'Internal',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#supervisor_data').editable({
                    container:'body',
                    selector:'td.university',
                    url:'../controllers/update_supervisor.php',
                    title:'University',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#supervisor_data').editable({
                    container:'body',
                    selector:'td.supj',
                    url:'../controllers/update_supervisor.php',
                    title:'Supervisor/Joint Supervisor',
                    type:'POST',
                    source:[
                        {
                            value:'Supervisor',text:'Supervisor'
                        },{
                            value:'Joint Supervisor',text:'Joint Supervisor'
                        }
                    ],
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#supervisor_data').editable({
                    container:'body',
                    selector:'td.res_sup_id',
                    url:'../controllers/update_supervisor.php',
                    title:'Res sup Id',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            });
            // Delete Supervisor
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_supervisor.php',
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