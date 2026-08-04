<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js"> 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
        <title>Funding | Details &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css"> 
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
         <div class="row w3-animate-right">
                <div class="col-sm-2 text-center">
                    <button class="btn btn-primary" id="demo01" href="#animatedModal">Add New</button>   
                    <a class="btn btn-success" href="excel_funding.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Individual Funding Details</h3>
                </div>
                <div class="col-sm-3">
                </div>
            </div>
            <p>&nbsp;</p>
            <table class="table table-striped table-bordered w3-animate-left">
                <thead>
                    <tr>
                    <th>Staff ID</th>
                    <th>Principle Investigator/Faculty Name</th>
                    <th>Co-Investigator/Faculty Name</th>
                    <th>Co-Investigator/Faculty ID</th>
                    <th>Title</th>
                    <th>Funding Agency</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Reference No</th>
                    <th>Action</th>
                    <th>X</th>
                    </tr>
                </thead>
                <tbody id="funding_data"></tbody>
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
                        <h2>Add New Funding Details</h2>
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
                                    <label class="col-sm-3">Principle Investigator/Faculty Name</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="staff_name" id="staff_name" value="" readonly>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                <!--<label class="col-sm-3">Principle Investigator/Faculty Name</label>
                                <div class="col-sm-9">
                                    <input type="text" class="form-control" name="piname" id="piname" placeholder="Principle Investigator/Faculty Name">
                                 </div>
                                 </div> -->
                                <div class="form-group has-success">
                                <label class="col-sm-3">Co-Investigator/Faculty Name</label>
                                <div class="col-sm-9">
                                <input type="text" class="form-control" name="copiname" id="copiname" placeholder="Co-Investigator/Faculty Name">
                                </div>
                                </div>
                                <div class="form-group has-success">
                                <label class="col-sm-3">Co-Investigator/Faculty ID</label>
                                <div class="col-sm-9">
                                <input type="text" class="form-control" name="copiid" id="copiid" placeholder="Co-Investigator/Faculty ID">
                                </div>
                                </div> 
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Title</label>
                                    <div class="col-sm-9">
                                        <textarea type="text" name="title" id="title" class="form-control" rows="3" value="">
                                        </textarea>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Funding Agency</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="fa" id="fa" placeholder="Funding Agency">
                                    </div>
                                </div>
                               
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Amount</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="amount" id="amount" class="form-control" placeholder="Amount">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Date</label>
                                    <div class="col-sm-9">
                                        <input type="date" name="date" id="date" class="form-control" placeholder="yyyy-mm-dd">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Status</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="status" id="status" value="">
                                        <option value="null">---------------</option>
                                        <option value="applied">Applied</option>
                                        <option value="received">Received</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class="form-group has-success referenceno">
                                    <label class="col-sm-3">Reference No</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="referenceno" id="referenceno" class="form-control" placeholder="Reference No">
                                    </div>
                                </div>
                                <div class="form-group has-success file">
                                    <label class="col-sm-3">Document Name</label>
                                    <div class="col-sm-9">
                                        <input type="file" name="file" id="file" class="form-control">
                                        <small class="help-block" style="color:red;">
                                        <br>Upload File size limit upto 2MB</br></small>
                                    </div>
                                </div>
                                <div class="text-center">
                                <input type="submit" id="funding_btn" name="funding_btn" value="PROCEED" class="btn btn-primary"/>
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
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/animatedModal.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
            $(document).ready(function(){
                function fetch_funding_data(){
                $.ajax({
                    url:'../controllers/fetch_funding.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                       for(c=0;c<data.length;c++){
                           var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                           html_data += '<td>'+data[c].staff_name+'</td>';
                           html_data += '<td data-name="copiname" class="copiname" data-type="text" data-pk="'+data[c].id+'">'+data[c].copiname+'</td>';
                           html_data += '<td data-name="copiid" class="copiid" data-type="number" data-pk="'+data[c].id+'">'+data[c].copiid+'</td>';
                           html_data += '<td data-name="title" class="title" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                           html_data += '<td data-name="fa" class="fa" data-type="text" data-pk="'+data[c].id+'">'+data[c].fa+'</td>';
                           html_data += '<td data-name="amount" class="amount" data-type="number" data-pk="'+data[c].id+'">'+data[c].amount+'</td>';
                           html_data += '<td data-name="date" class="date" data-type="date" data-pk="'+data[c].id+'">'+data[c].date+'</td>';
                           html_data += '<td data-name="status" class="status" data-type="select" data-pk="'+data[c].id+'">'+data[c].status+'</td>';
                           html_data += '<td data-name="referenceno" class="referenceno" data-type="text" data-pk="'+data[c].id+'">'+data[c].referenceno+'</td>';
                           html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                           html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#funding_data').append(html_data);
                       }
                    }
                  })
                }
            fetch_funding_data();
            // editable Bootstrap
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.referenceno',
                    url:'../controllers/update_funding.php',
                    title:'Referenco No',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.status',
                    url:'../controllers/update_funding.php',
                    title:'Status',
                    type:'POST',
                    source:[
                    {
                        value:'applied',text:'Applied'
                    },{
                        value:'received',text:'Received'
                    }
                ],
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.date',
                    url:'../controllers/update_funding.php',
                    title:'Date',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.amount',
                    url:'../controllers/update_funding.php',
                    title:'Amount',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.fa',
                    url:'../controllers/update_funding.php',
                    title:'Funding Agency',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.title',
                    url:'../controllers/update_funding.php',
                    title:'Title',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
            $('#funding_data').editable({
                    container:'body',
                    selector:'td.copiid',
                    url:'../controllers/update_funding.php',
                    title:'Co-Investigator/Faculty ID',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#funding_data').editable({
                    container:'body',
                    selector:'td.copiname',
                    url:'../controllers/update_funding.php',
                    title:'Co-Investigator/Faculty Name',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#funding_data').editable({
                    container:'body',
                    selector:'td.piname',
                    url:'../controllers/update_funding.php',
                    title:'Principle Investigator/Faculty Name',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#status').change(function(){
                    if($(this).val()=='applied'){
                        $('#referenceno').hide();
                        $('#file').show();
                        $('.referenceno').hide();
                        $('.file').show();
                        $('#piname').show();
                        $('#copiname').show();
                        $('#copiid').show();
                        $('#title').show();
                        $('#funding').show();
                        $('#amount').show();
                        $('#date').show();
                        $('#status').show();
                    }else if($(this).val()=='received'){
                        $('#referenceno').show();
                        $('#file').show();
                        $('#piname').show();
                        $('#copiname').show();
                        $('#copiid').show();
                        $('#title').show();
                        $('#funding').show();
                        $('#amount').show();
                        $('#date').show();
                        $('#status').show();
                        $('.referenceno').show();
                        $('.file').show();
                    }
                }
                )
            });
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_funding.php',
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