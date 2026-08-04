<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>ClubActivity &#183; SRECIMS</title>
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
                        <a class="btn btn-success" href="excel_clubactivity.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                    </div>
                    <div class="col-sm-7 text-center">
                        <h3>Club Activity Details</h3>
                    </div>
                    <div class="col-sm-3">
                    </div>
                </div>
                <p>&nbsp;</p>
                <table class="table table-striped table-bordered">
                    <thead class="table-success">
                        <tr>
                        <th>Club</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Organizer</th>
                        <th>Resource Person</th>
                        <th>No of Beneficiaries</th>
                        <th>Sponsership</th>
                        <th>Grants</th>
                        <th>Action</th>
                        <th>X</th>
                        </tr>
                    </thead>
                    <tbody id="club_content"></tbody>
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
                        <h2>Add New ClubActivity Details</h2>
                        </div>
                        <div class="panel-body">
                        <div class="row">
                        <div class="col-sm-2"></div>
                        <div class="col-sm-8">
                            <form class="form-horizontal" action="../controllers/insert_data.php" role="form" name="sentMsg" method="post" novalidate="" enctype="multipart/form-data">
                                <input type="hidden" class="form-control" name="staff_id" id="staff_id" value="" readonly>
                                     <div class="form-group has-success">
                                        <label class="col-sm-3">Club Name</label>
                                        <div class="col-sm-9">
                                            <select type="text" class="form-control" name="club" id="club" placeholder="club"></select>
                                        </div>
                                    </div>
                                    <div class="form-group has-success">
                                    <label class="col-sm-3">Type</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="type" id="type" placeholder="type">
                                        <option class="seminer">SEMINAR</option>
                                        <option class="workshop">WORKSHOP</option>
                                        <option class="symposium">TECHNICAL SYMPOSIUM</option>
                                        <option class="contest">CONTEST</option>
                                        <option class="conference">CONFERENCE</option>
                                        <option class="pep">PEP</option>
                                        <option class="fdp">FDP</option>
                                        <option class="other">OTHER</option>
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
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Organizer</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="organizer" id="staff_name" value="" readonly>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Resource Person</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="res_person" id="res_person" class="form-control" placeholder="Resource Person">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">No of Beneficiaries</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="ben_person" id="ben_person" class="form-control" placeholder="No of Beneficiaries">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Sponsership(if any)</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="sponsership" id="sponsership" class="form-control" placeholder="Sponsership">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Grants(if any)</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="granted" id="granted" class="form-control" placeholder="Grants">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Document Name</label>
                                    <div class="col-sm-9">
                                        <input type="file" name="file" id="file" class="form-control">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB<br>(KINDLY UPLOAD REPORTS IN WORD DOCUMENT CONTAINING IMAGES)</small>
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="club_btn" name="club_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_professional(){
                    $.ajax({
                        url:'../controllers/fetch_club_activity.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                $('select#club').append('<option>'+data[c].club_name+'</option>');
                            }
                        }
                    });
                  }
                fetch_professional();
                // fetch club
                function fetch_club_data(){
                $.ajax({
                    url:'../controllers/fetch_club.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                            var html_data = '<tr><td>'+data[c].club+'</td>';
                            html_data += '<td data-name="type" class="type" data-type="select" data-pk="'+data[c].id+'">'+data[c].type+'</td>';
                            html_data += '<td data-name="title" class="title" data-type="text" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                            html_data += '<td data-name="from_date" class="from_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].from_date+'</td>';
                            html_data += '<td data-name="to_date" class="to_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].to_date+'</td>';
                            html_data += '<td>'+data[c].organizer+'</td>';
                            html_data += '<td data-name="res_person" class="res_person" data-type="text" data-pk="'+data[c].id+'">'+data[c].res_person+'</td>';
                            html_data += '<td data-name="ben_person" class="ben_person" data-type="number" data-pk="'+data[c].id+'">'+data[c].ben_person+'</td>';
                            html_data += '<td data-name="sponsership" class="sponsership" data-type="text" data-pk="'+data[c].id+'">'+data[c].sponsership+'</td>';
                            html_data += '<td data-name="granted" class="granted" data-type="number" data-pk="'+data[c].id+'">'+data[c].granted+'</td>';
                            html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                            html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#club_content').append(html_data);
                        }
                    }
                  })
                };
            fetch_club_data();
            // Editable Bootstrap
            $('#club_content').editable({
                    container:'body',
                    selector:'td.granted',
                    url:'../controllers/update_club.php',
                    title:'Granted',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#club_content').editable({
                    container:'body',
                    selector:'td.sponsership',
                    url:'../controllers/update_club.php',
                    title:'Sponsership',
                    type:'POST'
                });
            $('#club_content').editable({
                    container:'body',
                    selector:'td.ben_person',
                    url:'../controllers/update_club.php',
                    title:'Ben Person',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#club_content').editable({
                    container:'body',
                    selector:'td.res_person',
                    url:'../controllers/update_club.php',
                    title:'Resource Person',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#club_content').editable({
                    container:'body',
                    selector:'td.to_date',
                    url:'../controllers/update_club.php',
                    title:'To date',
                    type:'POST',
                    placement:'right',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#club_content').editable({
                    container:'body',
                    selector:'td.type',
                    url:'../controllers/update_club.php',
                    title:'Type',
                    type:'POST',
                    source:[
                            {
                                value:'SEMINAR',text:'SEMINAR'
                            },{
                                value:'WORKSHOP',text:'WORKSHOP'
                            },{
                                value:'TECHNICAL SYMPOSIUM',text:'TECHNICAL SYMPOSIUM'
                            },{
                                value:'CONTEST',text:'CONTEST'
                            },{
                                value:'CONFERENCE',text:'CONFERENCE'
                            },{
                                value:'PEP',text:'PEP'
                            },{
                                value:'FDP',text:'FDP'
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
                $('#club_content').editable({
                    container:'body',
                    selector:'td.title',
                    url:'../controllers/update_club.php',
                    title:'Title',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#club_content').editable({
                    container:'body',
                    selector:'td.from_date',
                    url:'../controllers/update_club.php',
                    title:'From date',
                    type:'POST',
                    placement:'right',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            });
            // Delete clubactivity
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_club.php',
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
