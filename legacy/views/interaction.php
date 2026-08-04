<?php require('../models/restrict.php');
header('Content-type: text/html; charset=utf-8');
?>

<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Interaction | Details &#183; SREC FIS</title>
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
                    <a class="btn btn-success" href="excel_interaction.php" target="_new" ><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Interaction Details</h3>
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
                        <th>Type</th>
                        <th>Title/Acted As</th>
                        <th>From Date</th>
                        <th>To Date</th>
                        <th>Organizer</th>
                        <th>Action</th>
                        <th>X</th>
                    </tr>
                </thead>
                <tbody id="interaction_content"></tbody>
            </table>
            <!-- <form method="post" action="../controllers/fetch_interactionexcel.php"> -->
              <!-- <input type="submit" name="export_excel" class ="btn btn-success" value="Export to excel"> -->
    <div id="animatedModal">
            <div  id="btn-close-modal" class="close-animatedModal">
                Close <button class="btn btn-danger btn-sm">X</button>
            </div>
        <div class="modal-content">
            <div class="container">
                        <div class="panel panel-default">
                        <div class="section-title text-center">
                        <h2>Add New Interaction Details</h2>
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
                                    <label class="col-sm-3">Type</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="type" id="type" placeholder="type">
                                            <option>SEMINAR</option>
                                            <option>WORKSHOP</option>
                                            <option>FDP</option>
                                            <option> INDUSTRY INTERACTION</option>
                                            <option>PEP</option>
                                            <option>GUEST LECTURE</option>
                                            <option>SHORT TERM COURSE</option>
                                            <option>GIAN COURSE</option>
                                            <option>EXTERNAL EXAMINER</option>
                                            <option>TOURNAMENT</option>
						<option>OTHER</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Title/Acted As</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="title" id="title" class="form-control" placeholder="Title">
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
                                    <label class="col-sm-3">Document Name</label>
                                    <div class="col-sm-9">
                                        <input type="file" name="file" id="file" class="form-control">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB<br>(jpg,png,pdf,doc,docx)</small>
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="interaction_btn" name="interaction_btn" value="PROCEED" class="btn btn-primary"/>
                                <p>&nbsp;</p>
                                <div class="return"></div>
                                </div>

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
            function fetch_interaction_data(){
                $.ajax({
                    url:'../controllers/fetch_interaction.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(var c=0;c<data.length;c++){
                            var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="type" class="type" data-type="select" data-pk="'+data[c].id+'">'+data[c].type+'</td>';
                                html_data += '<td data-name="title" class="title" data-type="text" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                                html_data += '<td data-name="from_date" class="from_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].from_date+'</td>';
                                html_data += '<td data-name="to_date" class="to_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].to_date+'</td>';
                                html_data += '<td data-name="organizer" class="organizer" data-type="text" data-pk="'+data[c].id+'">'+data[c].organizer+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#interaction_content').append(html_data);
                        }
                    }
                });
            };
            fetch_interaction_data();
            // Editable Bootstrap
            $('#interaction_content').editable({
                container:'body',
                selector:'td.type',
                url:'../controllers/update_interaction.php',
                title:'Type',
                type:'POST',
                source:[
                    {
                        value:'SEMINAR',text:'SEMINAR'
                    },{
                        value:'WORKSHOP',text:'WORKSHOP'
                    },{
                        value:'FDP',text:'FDP'
                    },
                    {
                        value:'INDUSTRY INTERACTION',text:'INDUSTRY INTERACTION'
                    },
                    {
                        value:'GUEST LECTURE',text:'GEUST LECTURE'
                    },
                    {
                        value:'PEP',text:'PEP'
                    },
                    {
                        value:'SHORT TERM COURSE',text:'SHORT TERM COURSE'
                    },
                    {
                        value:'GIAN COURSE',text:'GIAN COURSE'
                    },
                    {
                        value:'EXTRNAL EXAMINER',text:'EXTERNAL EXAMINER'
                    },
                    {
                        value:'TOURNAMENT',text:'TOURNAMENT'
                    },
                    {
                        value:'OTHER',text:'OTHER'
                    }
                ],
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#interaction_content').editable({
                container:'body',
                selector:'td.title',
                url:'../controllers/update_interaction.php',
                title:'Title',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#interaction_content').editable({
                container:'body',
                selector:'td.from_date',
                url:'../controllers/update_interaction.php',
                title:'From Date',
                placement:'right',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#interaction_content').editable({
                container:'body',
                selector:'td.to_date',
                url:'../controllers/update_interaction.php',
                title:'To Date',
                placement:'right',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#interaction_content').editable({
                container:'body',
                selector:'td.organizer',
                url:'../controllers/update_interaction.php',
                title:'Organizer',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            // Delete Interaction
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_interaction.php',
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
