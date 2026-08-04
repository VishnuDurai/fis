<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Academics &#183; SRECFIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container">
        <div class="panel panel-default">
                <div class="section-title text-center">
                <h2>Academics Details</h2>
                </div>
                <div class="panel-body">
                <div class="row">
                <div class="col-sm-2"></div>
                <div class="col-sm-8">
                    <form class="form-horizontal">
                        <div class="form-group has-error">
                            <label class="col-sm-3">Staff Id</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                    <span id="staff_id"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Staff Name</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="staff_name"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Date of Joining</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="doj"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Department</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="department"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Designation</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="designation"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Qualification</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="qualification"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Area of Specialization</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="area"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Title of Thesis</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="title"></span>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="col-sm-2"></div>
                </div>
                </div>
            </div>
        </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_academics_data(){
                $.ajax({
                    url:'../controllers/fetch_academics.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                    for(c=0;c<data.length;c++){
                        $('#staff_id').append(data[c].staff_id);
                        $('#staff_name').append(data[c].staff_name);
                        $('input#staff_id').val(data[c].staff_id);
                        $('input#staff_name').val(data[c].staff_name);
                        $('#doj').append(data[c].Date_of_joining);
                        $('#department').append(data[c].Department);
                        $('#designation').append(data[c].Designation);
                        $('#qualification').append(data[c].Qualification);
                        $('#area').append('<div data-name="area_of_special" class="area" data-type="text" data-pk="'+data[c].id+'">'+data[c].area_of_special+'</div>');
                        $('#title').append('<div data-name="title_of_thesis" class="title" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].title_of_thesis+'</div>');
                    }
                  }
                })
              };
            fetch_academics_data();
            // Editable Bootstrap
            $('#area').editable({
                container:'body',
                selector:'div.area',
                title:'Enter the Area of Specialization',
                url:'../controllers/update_academics.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
            });
            $('#title').editable({
                container:'body',
                selector:'div.title',
                title:'Enter the Title of Thesis',
                url:'../controllers/update_academics.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
              });
            });
        </script>
    </body>
    <body style="background:url(2.jpg); background-repeat:no-repeat;background-size:100% 100%;height:800px;background-attachment:fixed">
</html>
