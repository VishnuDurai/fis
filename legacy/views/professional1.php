<?php require('../models/restrict.php');
header('Content-type: text/html; charset=utf-8');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Professional Society Membership &#183; SREC FIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/bootstrap-editable.css">
        <link rel="stylesheet" href="../css/normalize.min.css">
        <link rel="stylesheet" href="../css/animate.min.css">
        <link rel="stylesheet" href="../css/style.css">
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container-fluid">
            <div class="row">
                <div class="col-sm-2 text-center">
                    <button class="btn btn-primary" id="demo01" href="#animatedModal">Add New</button>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Professional Society membership</h3>
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
                        <th>Membership ID</th>
                        <th>Organization</th>
                        <th>X</th>
                    </tr>
                </thead>
                <tbody id="professional_content"></tbody>
            </table>
    <div id="animatedModal">
            <div  id="btn-close-modal" class="close-animatedModal">
                Close <button class="btn btn-danger btn-sm">X</button>
            </div>
        <div class="modal-content">
            <div class="container">
                        <div class="panel panel-default">
                        <div class="section-title text-center">
                        <h2>Add New Professional Society Membership</h2>
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
                                    <label class="col-sm-3">Membership ID</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="membershipid" id="membershipid" placeholder="Membership Id">
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Organization</label>
                                    <div class="col-sm-9">
                                          <select type="text" class="form-control" name="organization" id="organization" class="form-control" placeholder="Organization"></select>
                                    </div>
                                </div>
                              </div>
                                <div class="text-center">
                                <br>
                                <input type="submit" id="profession_btn" name="profession_btn" value="PROCEED" class="btn btn-primary"/>
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
            function fetch_professional_data(){
                $.ajax({
                    url:'../controllers/fetch_professional.php',
                    method:'POST',
                    dataType:'json',
                    success:function(data){
                        for(c=0;c<data.length;c++){
                          var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                            html_data +='<td>'+data[c].staff_name+'</td>';
                            html_data += '<td data-name="membershipid" class="membershipid" data-type="number" data-pk="'+data[c].id+'">'+data[c].membershipid+'</td>';
                            html_data += '<td data-name="organization" class="organization" data-type="text" data-pk="'+data[c].id+'">'+data[c].organization+'</td>';
                            html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                          $('#professional_content').append(html_data);
                        }
                    }
                })
              };
            fetch_professional_data();
            // Insert professional Details
            $('#profession_btn').click(function(){
                $.ajax({
                    url:'../controllers/insert_data.php',
                    method:'POST',
                    data:$('#professional_data').serialize(),
                    success:function(data){
                        if(data){
                            $('#membershipid').val('');

                            $('.return').fadeIn().html(data);
                            setTimeout(function(){
                                $('.return').fadeOut('slow');
                            },3000);
                        }
                    }
                })
            });

      // fetch_professional_content();
        function fetch_organization()
        {
          $.ajax({
              url:'../controllers/fetch_org.php',
              method:'POST',
              dataType:'json',
              success:function(data){
                  for(c=0;c<data.length;c++){
                      $('select#organization').append('<option>'+data[c].pro_name+'</option>');
                  }
              }
          });
        }
      fetch_organization();
});

            // Delete Interaction
            function confirmGetMessage(id) {
                var theAnswer = confirm("Are you sure to delete?");
                var id = id;
                if (theAnswer){
                $.ajax({
                    url:'../controllers/delete_professional.php',
                    method:'POST',
                    data:{id:id},
                    success:function(data){
                    if(data=='One Record Deleted Successfully!'){
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
