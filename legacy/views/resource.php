<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Resourcperson | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_resource.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Resourceperson Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead class="table-success">
                    <tr>
                        <th>Faculty Id</th>
                        <th>Faculty Name</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Acted As</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Organizer</th>
                        <th>No of Beneficery</th>
                        <th>Action</th>
                        <th>X</th>
                    </tr>
                </thead>
                <tbody id="resource_data"></tbody>
            </table>
            <div id="animatedModal">
            <div  id="btn-close-modal" class="close-animatedModal"> 
                Close <button class="btn btn-danger btn-sm">X</button>
            </div>
        <div class="modal-content">
            <div class="container">
                        <div class="panel panel-default">
                        <div class="section-title text-center">
                        <h2>Add New Resource Person</h2>
                        </div>
                        <div class="panel-body">
                        <div class="row">
                        <div class="col-sm-2"></div>
                        <div class="col-sm-8">
                            <form class="form-horizontal" action="../controllers/insert_data.php" role="form" name="sentMsg" method="post" novalidate="" enctype="multipart/form-data">
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Faculty ID</label>
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
                                    <label class="col-sm-3">Type</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="type" id="type" placeholder="type">
                                            <option>SEMINAR</option>
                                            <option>WORKSHOP</option>
                                            <option>FDP</option>
                                            <option>PEER ENABLEMENT PROGRAM</option>
                                            <option>CONFERENCE</option>
                                            <option>GUEST LECTURE</option>
                                            <option>OTHER</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Title</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="title" id="title" class="form-control" placeholder="Title">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Acted As</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="actedas" id="actedas" class="form-control" placeholder="Acted As">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">From Date</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="from_date" id="StartDate" class="form-control">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">To Date</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="to_date" id="EndDate" class="form-control">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Organizer</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="organizer" id="organizer" class="form-control" placeholder="Organizer">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">No of Beneficery</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="ben" id="ben" class="form-control" placeholder="Beneficery">
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
                                <input type="submit" id="resource_btn" name="resource_btn" value="PROCEED" class="btn btn-primary"/>
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
        </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/animatedModal.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
               function fetch_resource_data(){
                   $.ajax({
                       url:'../controllers/fetch_resource.php',
                       method:'POST',
                       dataType:'json',
                       success:function(data){
                           for(c=0;c<data.length;c++){
                               var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                               html_data += '<td>'+data[c].staff_name+'</td>';
                               html_data += '<td data-name="type" class="type" data-type="select" data-pk="'+data[c].id+'">'+data[c].type+'</td>';
                               html_data += '<td data-name="title" class="title" data-type="text" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                               html_data += '<td data-name="actedas" class="actedas" data-type="text" data-pk="'+data[c].id+'">'+data[c].actedas+'</td>';
                               html_data += '<td data-name="from_date" class="from_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].from_date+'</td>';
                               html_data += '<td data-name="to_date" class="to_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].to_date+'</td>';
                               html_data += '<td data-name="organizer" class="organizer" data-type="text" data-pk="'+data[c].id+'">'+data[c].organizer+'</td>';
                               html_data += '<td data-name="ben" class="ben" data-type="number" data-pk="'+data[c].id+'">'+data[c].ben+'</td>';
                               html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                               html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                           $('#resource_data').append(html_data);
                           }
                       }
                   })
               }
               fetch_resource_data();
                //Editable Bootstrap
                $('#resource_data').editable({
                container:'body',
                selector:'td.type',
                url:'../controllers/update_resource.php',
                title:'Type',
                type:'POST',
                source:[
                    {
                        value:'FDP',text:'FDP'
                    },{
                        value:'WORKSHOP',text:'WORKSHOP'
                    },{
                        value:'SEMINAR',text:'SEMINAR'
                    },{
                        value:'PEER ENABLEMENT PROGRAM',text:'PEER ENABLEMENT PROGRAM'
                    },{
                        value:'CONFERENCE',text:'CONFERENCE'
                    },{
                        value:'GUEST LECTURE',text:'GUEST LECTURE'
                    },{
                        value:'OTHER',text:'OTHER'
                    }
                    
                ],
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
              });
              $('#resource_data').editable({
                container:'body',
                selector:'td.title',
                url:'../controllers/update_resource.php',
                title:'Title',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#resource_data').editable({
                container:'body',
                selector:'td.actedas',
                url:'../controllers/update_resource.php',
                title:'Acted as',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#resource_data').editable({
                container:'body',
                selector:'td.from_date',
                url:'../controllers/update_resource.php',
                title:'From Date',
                placement:'right',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#resource_data').editable({
                container:'body',
                selector:'td.to_date',
                url:'../controllers/update_resource.php',
                title:'To Date',
                placement:'right',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#resource_data').editable({
                container:'body',
                selector:'td.organizer',
                url:'../controllers/update_resource.php',
                title:'Organizer',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#resource_data').editable({
                container:'body',
                selector:'td.ben',
                url:'../controllers/update_resource.php',
                title:'No of Beneficery',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            });
            // Delete resource
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_resource.php',
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