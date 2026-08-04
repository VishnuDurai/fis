<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Personal &#183; SRECFIS</title>
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
            <h2>Personal Details</h2>
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
                            <label class="col-sm-3">DOB</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="dob"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-error">
                            <label class="col-sm-3">Gender</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="gender"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Address</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="address"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Mobile</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="mobile"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Email</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="email"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Pan no</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="pan"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Aadhar no</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="aadhar"></span>
                                </div>
                            </div>
                        </div>
                        <div class="form-group has-success">
                            <label class="col-sm-3">Type of Faculty</label>
                            <div class="col-sm-9">
                                <div class="form-control">
                                <span id="type"></span>
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
                function fetch_personal_data(){
                $.ajax({
                    url:'../controllers/fetch_personal.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                                $('#staff_id').append(data[c].staff_id);
                                $('#staff_name').append(data[c].staff_name);
                                $('#dob').append(data[c].dob);
                                $('#gender').append(data[c].gender);
                                $('#address').append('<div data-name="address" class="address" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].address+'</div>');
                                $('#mobile').append('<div data-name="mobile" class="mobile" data-type="number" data-pk="'+data[c].id+'">'+data[c].mobile+'</div>');
                                $('#email').append('<div data-name="email" class="email" data-type="email" data-pk="'+data[c].id+'">'+data[c].email+'</div>');
                                $('#pan').append('<div data-name="pan" class="pan" data-type="text" data-pk="'+data[c].id+'">'+data[c].pan+'</div>');
                                $('#aadhar').append('<div data-name="aadhar" class="aadhar" data-type="number" data-pk="'+data[c].id+'">'+data[c].aadhar+'</div>');
                                $('#type').append('<div data-name="type" class="type" data-type="select" data-pk="'+data[c].id+'">'+data[c].type+'</div>');
                            }
                        }
                    })
                };
            fetch_personal_data();
            // Editable Bootstrap
            $('#address').editable({
            container:'body',
            selector:'div.address',
            title:'Enter the Address:',
            url:'../controllers/update_personal.php',
            type:'POST',
            validate:function(value){
                if($.trim(value) == ''){
                        return 'This field is required';
                    }
                 }
             });
            $('#mobile').editable({
                container:'body',
                selector:'div.mobile',
                title:'Enter the Mobile no:',
                url:'../controllers/update_personal.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                            return 'This field is required';
                        }
                        var exp = /^[0-9]+$/;
                        if(!exp.test(value)){
                            return 'Number only';
                        }
                    }
                });
            $('#email').editable({
                container:'body',
                selector:'div.email',
                title:'Enter the email:',
                url:'../controllers/update_personal.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#pan').editable({
                container:'body',
                selector:'div.pan',
                title:'Enter the Pan no:',
                url:'../controllers/update_personal.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#aadhar').editable({
                container:'body',
                selector:'div.aadhar',
                title:'Enter the Aadhar no:',
                url:'../controllers/update_personal.php',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                            return 'This field is required';
                        }
                        var exp = /^[0-9]+$/;
                        if(!exp.test(value)){
                            return 'Number only';
                        }
                    }
                });
            $('#type').editable({
                container:'body',
                selector:'div.type',
                title:'Enter the Type of Faculty:',
                url:'../controllers/update_personal.php',
                type:'POST',
                source:[{
                    value:'Teaching',text:'Teaching'
                },{
                    value:'Non Teaching',text:'Non Teaching'
                }],
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
