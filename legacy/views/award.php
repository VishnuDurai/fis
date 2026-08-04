<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Award | Details &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_awards.php"><i class="fa fa-download" aria-hidden="ture"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Award Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead class="table-success">
                    <tr>
                        <th>Staff ID</th>
                        <th>Staff Name</th>
                        <th>Award Name</th>
                        <th>Awarded By</th>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Action</th>
                        <th>X</th>
                    </tr>
                </thead>
                <tbody id="award_body"></tbody>
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
                        <h2>Add New Award Details</h2>
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
                                    <label class="col-sm-3">Award Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="awardname" id="awardname" class="form-control" placeholder="Award Name" required="">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Awarded By</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="awardby" id="awardby" class="form-control" placeholder="Awarded By" required="">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Event</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="event" id="event" class="form-control" placeholder="Event" required="">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Date</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="awa_date" id="awa_date" class="form-control" placeholder="date" required="">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Document Name</label>
                                    <div class="col-sm-9">
                                        <input type="file" name="file" id="file" class="form-control" required="">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB<br>(jpg,png,pdf,doc,docx)</small>
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="award_btn" name="award_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_award_data(){
                    $.ajax({
                        url:'../controllers/fetch_award.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="awardname" class="awardname" data-type="text" data-pk="'+data[c].id+'">'+data[c].awardname+'</td>';
                                html_data += '<td data-name="awardby" class="awardby" data-type="text" data-pk="'+data[c].id+'">'+data[c].awardby+'</td>';
                                html_data += '<td data-name="event" class="event" data-type="text" data-pk="'+data[c].id+'">'+data[c].event+'</td>';
                                html_data += '<td data-name="awa_date" class="awa_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].awa_date+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                                $('#award_body').append(html_data);
                            }
                        }
                    })
                }
                fetch_award_data();
                //Editable bootstrap
                $('#award_body').editable({
                    container:'body',
                    selector:'td.awa_date',
                    url:'../controllers/update_award.php',
                    title:'Award Date',
                    type:'POST',
                    placement:'right',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#award_body').editable({
                    container:'body',
                    selector:'td.awardname',
                    url:'../controllers/update_award.php',
                    title:'Award Name',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#award_body').editable({
                    container:'body',
                    selector:'td.awardby',
                    url:'../controllers/update_award.php',
                    title:'Award By',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#award_body').editable({
                    container:'body',
                    selector:'td.event',
                    url:'../controllers/update_award.php',
                    title:'Event',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            });
            // Delete award
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_award.php',
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
            // animated modal
            $("#demo01").animatedModal({
                color:'#ecf0f1'
            });
        </script>
    </body>
</html>
