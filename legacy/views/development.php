<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>ResearchDevelopment &#183; SRECIMS</title>
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
                    <a class="btn btn-success" href="excel_evento.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Research Development Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered">
                <thead class="table-success">
                    <tr>
                    <th>Type</th>
                    <th>Priniciple investigator/faculty name</th>
                    <th>Priniciple inestigator/faculty ID</th>
                    <th>Co-investigator/faculty name</th>
                    <th>Co-inestigator/faculty ID</th>
                    <th>Title</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Academics year</th>
                    <th>Status</th>
                    <th>Institution</th>
                    <th>Revenue</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="development_data"></tbody>
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
                        <h2>Add New Research Development Details</h2>
                        </div>
                        <div class="panel-body">
                        <div class="row">
                        <div class="col-sm-2"></div>
                        <div class="col-sm-8">
                            <form class="form-horizontal" action="../controllers/insert_data.php" role="form" name="sentMsg" method="post" novalidate="" enctype="multipart/form-data">
                            <div class="form-group has-success">
                                    <label class="col-sm-3">Type</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="type" id="type" placeholder="type">
                                            <option class="sponsored">Sponsored</option>
                                            <option class="consultancy">Consultancy</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Principle investigator/ Faculty Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_name" id="staff_name" value="">
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Co-invesgator/ Faculty Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="coname" id="coname" value="" placeholder="Co-invesgator/ Faculty Name">
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Principle Investigator/ Faculty ID</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_id" id="staff_id" value="" placeholder="Principle Investigator/ Faculty ID">
                                    </div>
                                </div>
                                <div class="form-group has-error">
                                    <label class="col-sm-3">Co-investigator/ Faculty ID</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="coid" id="coid" value="" placeholder="Co-investigator/ Faculty ID">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Title of the Project</label>
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
                                    <label class="col-sm-3">Academics Year</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="year_aca" id="year_aca" class="form-control" placeholder="Academics Year">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Status</label>
                                    <div class="col-sm-9">
                                      <select type="text" class="form-control" name="status" id="status" placeholder="type">
                                          <option class="sponsored">On Going</option>
                                          <option class="consultancy">Completed</option>
                                      </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Name of the Institution</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="institution" id="institution" class="form-control" placeholder="Name of the Institution">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Revenue Generated</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="revenue" id="revenue" class="form-control" placeholder="Revenue Generated">
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="development_btn" name="development_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_development_data(){
                    $.ajax({
                        url:'../controllers/fetch_development.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td data-name="type" class="type" data-type="select" data-pk="'+data[c].id+'">'+data[c].type+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td>'+data[c].staff_id+'</td>';
                                html_data += '<td data-name="coname" class="coname" data-type="text" data-pk="'+data[c].id+'">'+data[c].coname+'</td>';
                                html_data += '<td data-name="coid" class="coid" data-type="number" data-pk="'+data[c].id+'">'+data[c].coid+'</td>';
                                html_data += '<td data-name="title" class="title" data-type="text" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                                html_data += '<td data-name="from_date" class="from_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].from_date+'</td>';
                                html_data += '<td data-name="to_date" class="to_date" data-type="date" data-pk="'+data[c].id+'">'+data[c].to_date+'</td>';
                                html_data += '<td data-name="year_aca" class="year_aca" data-type="text" data-pk="'+data[c].id+'">'+data[c].year_aca+'</td>';
                                html_data += '<td data-name="status" class="status" data-type="select" data-pk="'+data[c].id+'">'+data[c].status+'</td>';
                                html_data += '<td data-name="institution" class="institution" data-type="text" data-pk="'+data[c].id+'">'+data[c].institution+'</td>';
                                html_data += '<td data-name="revenue" class="revenue" data-type="number" data-pk="'+data[c].id+'">'+data[c].revenue+'</td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#development_data').append(html_data);
                            }
                        }
                    })
                };
                fetch_development_data();
                // Editable bootstrap
                $('#development_data').editable({
                    container:'body',
                    selector:'td.status',
                    url:'../controllers/update_development.php',
                    title:'Status',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.institution',
                    url:'../controllers/update_development.php',
                    title:'Institution',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.revenue',
                    url:'../controllers/update_development.php',
                    title:'Revenue',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.type',
                    url:'../controllers/update_development.php',
                    title:'Type',
                    type:'POST',
                    source:[
                        {
                            value:'Sponsored',text:'Sponsored'
                        },{
                            value:'Consultancy',text:'Consultancy'
                        }
                    ],
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.year_aca',
                    url:'../controllers/update_development.php',
                    title:'Year',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.coname',
                    url:'../controllers/update_development.php',
                    title:'Co-name',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.coid',
                    url:'../controllers/update_development.php',
                    title:'Co-id',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.title',
                    url:'../controllers/update_development.php',
                    title:'Title',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.from_date',
                    url:'../controllers/update_development.php',
                    title:'From Date',
                    placement:'right',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.to_date',
                    url:'../controllers/update_development.php',
                    title:'To Date',
                    placement:'right',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
              });
                $('#development_data').editable({
                    container:'body',
                    selector:'td.status',
                    url:'../controllers/update_development.php',
                    title:'Status',
                    placement:'right',
                    type:'POST',
                    source:[
                        {
                            value:'On Going',text:'On Going'
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
            // Delete development
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_development.php',
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
