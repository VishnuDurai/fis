<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js" > 
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>BookPublished | Details &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
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
                    <button class="btn btn-primary" id="demo01" data-toggle="modal" data-target="#myModal">Add New</button>
                    <a class="btn btn-success" href="excel_bookpub.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>   
                </div>
                <div class="col-sm-7 text-center">
                    <h3>BookPublished Details</h3>
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
                        <th>Title of Book</th>
                        <th>Co-Author</th>
                        <th>Publisher</th>
						<th>Date Of Publication</th>
                        <th>Edition</th>
                        <th>ISSN/ISBN</th>
                        <th>Action</th>
                        <th>X</th>
                    </tr>
                </thead>
                <tbody id="bpublished_data"></tbody>
            </table>
            <div id="myModal" class="modal fade">
            <div  id="btn-close-modal" class="close-myModal"> 
                Close <button class="btn btn-danger btn-sm" data-dismiss="modal">X</button>
            </div>
        <div class="modal-content">
            <div class="container">
                        <div class="panel panel-default">
                        <div class="section-title text-center">
                        <h2>Add New bookpublished Details</h2>
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
                                    <label class="col-sm-3">Title of Book</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="title" id="title" class="form-control" placeholder="Title">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Co-Author</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="coauthor" id="coauthor" class="form-control" placeholder="coauthor">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Publisher</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="publisher" id="publisher" class="form-control" placeholder="publisher">
                                    </div>
                                </div>
								<div class="form-group has-success">
								 <label class="col-sm-3">Date Of Publication</label>
								  <div class="col-sm-9">
								        <input type="date" name="dateofpublication" id="dateofpublication" class="form-control" placeholder="yyyy-mm-dd">
										</div>
										</div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Edition</label>
                                    <div class="col-sm-9">
                                        <input type="number" name="edition" id="edition" class="form-control" placeholder="edition">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">ISSN/ISBN</label>
                                    <div class="col-sm-9">
                                        <input type="text" name="isbn" id="isbn" class="form-control" placeholder="isbn">
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
                                <input type="submit" id="bpublished_btn" name="bpublished_btn" value="PROCEED" class="btn btn-primary"/>
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
    </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/bootstrap-edittable.min.js"></script>
        <script src="../js/animatedModal.min.js"></script>
        <script src="../js/script.js"></script>
        <script>
           $(document).ready(function(){
                function fetch_bpublished_data(){
                   $.ajax({
                       url:'../controllers/fetch_bookpublished.php',
                       method:'POST',
                       dataType:'json',
                       success:function(data){
                           for(c=0;c<data.length;c++){
                               var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                               html_data += '<td>'+data[c].staff_name+'</td>';
                               html_data += '<td data-name="title" class="title" data-type="text" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                               html_data += '<td data-name="coauthor" class="coauthor" data-type="text" data-pk="'+data[c].id+'">'+data[c].coauthor+'</td>';
                               html_data += '<td data-name="publisher" class="publisher" data-type="text" data-pk="'+data[c].id+'">'+data[c].publisher+'</td>';
							   html_data += '<td data-name="dateofpublication" class="dateofpublication" data-type="date" data-pk="'+data[c].id+'">'+data[c].dateofpublication+'</td>';
                               html_data += '<td data-name="edition" class="edition" data-type="number" data-pk="'+data[c].id+'">'+data[c].edition+'</td>';
                               html_data += '<td data-name="isbn" class="isbn" data-type="text" data-pk="'+data[c].id+'">'+data[c].isbn+'</td>';
                               html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                               html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#bpublished_data').append(html_data);
                            }
                       }
                   });
               };
               fetch_bpublished_data();
            // update bookpublished
            $('#bpublished_data').editable({
                    container:'body',
                    selector:'td.title',
                    url:'../controllers/update_bookpublished.php',
                    title:'Title',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#bpublished_data').editable({
                    container:'body',
                    selector:'td.coauthor',
                    url:'../controllers/update_bookpublished.php',
                    title:'Co-Author',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#bpublished_data').editable({
                    container:'body',
                    selector:'td.publisher',
                    url:'../controllers/update_bookpublished.php',
                    title:'Publisher',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#bpublished_data').editable({
                    container:'body',
                    selector:'td.edition',
                    url:'../controllers/update_bookpublished.php',
                    title:'Edition',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                $('#bpublished_data').editable({
                    container:'body',
                    selector:'td.isbn',
                    url:'../controllers/update_bookpublished.php',
                    title:'Isbn',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
				$('#bpublished_data').editable({
                    container:'body',
                    selector:'td.dateofpublication',
                    url:'../controllers/update_bookpublished.php',
                    title:'Date Of Publication',
                    type:'POST',
                    validate:function(value){
                        if($.trim(value) == ''){
                            return 'This field is required';
                        }
                    }
                });
                    
                });
                // Modal popup
                $("#demo01").animatedModal({
                  color:'#ecf0f1'
               });
           // Delete BookPublished
           function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_bookpublished.php',
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
        </script>
    </body>
</html>