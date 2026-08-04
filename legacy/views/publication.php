<?php require('../models/restrict.php');
header('Content-type: text/html; charset=utf-8');?>
<!DOCTYPE html>
<html class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Publication | Details &#183; SRECFIS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
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
                    <a class="btn btn-success" href="excel_publication.php"><i class="fa fa-download" aria-hidden="true"></i>&nbsp; Export Excel</a>
                </div>
                <div class="col-sm-7 text-center">
                    <h3>Publication Details</h3>
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
                        <th>Type of Publication</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Name of Journal/conference</th>
                        <th>Date of conference</th>
                        <th>Organizer(conference)</th>
                        <th>DOI</th>
                        <th>ISSN/ISBN</th>
                        <th>Month</th>
                        <th>Volume</th>
                        <th>PP</th>
                        <th>Scopus Indexed</th>
                        <th>Citations</th>
                        <th>H-index</th>
                        <th>Impact Factor</th>
                        <th>Action</th>
                        <th>X</th>
                    </tr>
                </thead>
                <tbody id="publication_data"></tbody>
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
                        <h2>Add New Publication Details</h2>
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
                                    <label class="col-sm-3">Type of Publication</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="type_pub" id="Publication" value="">
                                            <option value="null">---------</option>
                                            <option value="Journal">Journal</option>
                                            <option value="Conference">Conference</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Type</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="type" id="type" value="">
                                            <option class="sponsored">National</option>
                                            <option class="consultancy">International</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success role">
                                    <label class="col-sm-3">Participated/presented</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="role" id="role" value="">
                                            <option value="null">--------</option>
                                            <option value="par">Participated</option>
                                            <option value="pre">Presented</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success title">
                                    <label class="col-sm-3">Title of article</label>
                                    <div class="col-sm-9">
                                        <textarea type="text" class="form-control" rows="3" name="title" id="title" value="">
                                        </textarea>
                                    </div>
                                </div>
                                <div class="form-group has-success">
                                    <label class="col-sm-3">Name of the Journal/Conference</label>
                                    <div class="col-sm-9">
                                        <textarea type="text" class="form-control" rows="3" name="journel" id="journel" value="">
                                        </textarea>
                                    </div>
                                </div>
                                <div class="form-group has-success" id="lab1">
                                    <label class="col-sm-3">Date of Conference</label>
                                    <div class="col-sm-9">
                                        <input type="date" class="form-control" name="date_con" id="data" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success" id="lab2">
                                    <label class="col-sm-3">Organizer(Conference)</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="organizer" id="org" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success doi">
                                    <label class="col-sm-3">DOI</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="doi" id="doi" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success isbn">
                                    <label class="col-sm-3">ISSN/ISBN</label>
                                    <div class="col-sm-9">
                                        <input type="number" class="form-control" name="isbn" id="isbn" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success month">
                                    <label class="col-sm-3">Month</label>
                                    <div class="col-sm-9">
                                        <input type="month" class="form-control" name="month_pub" id="month" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success volume">
                                    <label class="col-sm-3">Volume</label>
                                    <div class="col-sm-9">
                                        <input type="number" class="form-control" name="volume_pub" id="volume" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success pp">
                                    <label class="col-sm-3">PP</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="pp" id="pp" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success scopus">
                                    <label class="col-sm-3">Scopus Indexed</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="index_pub" id="scopus" value="">
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success web">
                                    <label class="col-sm-3">Web of Science Index</label>
                                    <div class="col-sm-9">
                                        <select type="text" class="form-control" name="web_of_science" id="web" value="">
                                            <option>Yes</option>
                                            <option>No</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group has-success citations">
                                    <label class="col-sm-3">Citations</label>
                                    <div class="col-sm-9">
                                        <input type="number" class="form-control" name="citations" id="citations" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success hindex">
                                    <label class="col-sm-3">H-index</label>
                                    <div class="col-sm-9">
                                        <input type="number" class="form-control" name="hindex" id="hindex" value="">
                                    </div>
                                </div>
                                <div class="form-group has-success impact">
                                    <label class="col-sm-3">Impact Factor</label>
                                    <div class="col-sm-9">
                                        <input type="text" class="form-control" name="impact" id="impact" step="0.01" value="">
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
                                <input type="submit" id="publication_btn" name="publication_btn" value="PROCEED" class="btn btn-primary"/>
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
                function fetch_publication_data(){
                    $.ajax({
                        url:'../controllers/fetch_publication.php',
                        method:'POST',
                        dataType:'json',
                        success:function(data){
                            for(c=0;c<data.length;c++){
                                var html_data = '<tr><td>'+data[c].staff_id+'</td>';
                                html_data += '<td>'+data[c].staff_name+'</td>';
                                html_data += '<td data-name="type_pub" class="type_pub" data-type="select" data-pk="'+data[c].id+'">'+data[c].type_pub+'</td>';
                                html_data += '<td data-name="type" class="type" data-type="select" data-pk="'+data[c].id+'">'+data[c].type+'</td>';
                                html_data += '<td data-name="title" class="title" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].title+'</td>';
                                html_data += '<td data-name="journel" class="journel" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].journel+'</td>';
                                html_data += '<td data-name="date_con" class="date_con" data-type="date" data-pk="'+data[c].id+'">'+data[c].date_con+'</td>';
                                html_data += '<td data-name="organizer" class="organizer" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].organizer+'</td>';
                                html_data += '<td data-name="doi" class="doi" data-type="textarea" data-pk="'+data[c].id+'">'+data[c].doi+'</td>';
                                html_data += '<td data-name="isbn" class="isbn" data-type="number" data-pk="'+data[c].id+'">'+data[c].isbn+'</td>';
                                html_data += '<td data-name="month_pub" class="month_pub" data-type="text" data-pk="'+data[c].id+'">'+data[c].month_pub+'</td>';
                                html_data += '<td data-name="volume_pub" class="volume_pub" data-type="number" data-pk="'+data[c].id+'">'+data[c].volume_pub+'</td>';
                                html_data += '<td data-name="pp" class="pp" data-type="text" data-pk="'+data[c].id+'">'+data[c].pp+'</td>';
                                html_data += '<td data-name="index_pub" class="index_pub" data-type="select" data-pk="'+data[c].id+'">'+data[c].index_pub+'</td>';
                                html_data += '<td data-name="citations" class="citations" data-type="number" data-pk="'+data[c].id+'">'+data[c].citations+'</td>';
                                html_data += '<td data-name="hindex" class="hindex" data-type="number" data-pk="'+data[c].id+'">'+data[c].hindex+'</td>';
                                html_data += '<td data-name="impact" class="impact" data-type="text" data-pk="'+data[c].id+'">'+data[c].impact+'</td>';
                                html_data += '<td><a href="../admin/document/'+data[c].file+'" class="btn btn-primary btn-sm" target="_blank">View</a></td>';
                                html_data += '<td><input type="button" onclick="confirmGetMessage('+data[c].id+')" value="X" class="btn btn-danger btn-sm"></td></tr>';
                            $('#publication_data').append(html_data);
                            console.log(html_data);
                            }
                        }
                    })
                }
                fetch_publication_data();
                // Animated Model popup
                $("#demo01").animatedModal({
                            color:'#ecf0f1'
                     });
                // Editable Boostrap
                $('#publication_data').editable({
                container:'body',
                selector:'td.type_pub',
                url:'../controllers/update_publication.php',
                title:'Type of Publication',
                type:'POST',
                source:[
                    {
                        value:'Journal',text:'Journal'
                    },{
                        value:'Conference',text:'Conference'
                    }
                ],
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.type',
                url:'../controllers/update_publication.php',
                title:'Type',
                type:'POST',
                source:[
                    {
                        value:'National',text:'National'
                    },{
                        value:'International',text:'International'
                    }
                ],
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.title',
                url:'../controllers/update_publication.php',
                title:'Title of article',
                type:'POST',
                placement:'right',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.journel',
                url:'../controllers/update_publication.php',
                title:'Name of the Journal/Conference',
                type:'POST',
                placement:'right',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.date_con',
                url:'../controllers/update_publication.php',
                title:'Date of Conference',
                placement:'right',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.organizer',
                url:'../controllers/update_publication.php',
                title:'organizer',
                type:'POST',
                placement:'right',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.doi',
                url:'../controllers/update_publication.php',
                title:'DOI',
                type:'POST',
                placement:'right',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.isbn',
                url:'../controllers/update_publication.php',
                title:'ISBN',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.month_pub',
                url:'../controllers/update_publication.php',
                title:'Month',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.volume_pub',
                url:'../controllers/update_publication.php',
                title:'Volume',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.pp',
                url:'../controllers/update_publication.php',
                title:'PP',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.index_pub',
                url:'../controllers/update_publication.php',
                title:'Scopus Indexed',
                type:'POST',
                source:[
                    {
                        value:'Yes',text:'Yes'
                    },{
                        value:'No',text:'No'
                    }
                ],
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.citations',
                url:'../controllers/update_publication.php',
                title:'Citations',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.hindex',
                url:'../controllers/update_publication.php',
                title:'H-index',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });
                $('#publication_data').editable({
                container:'body',
                selector:'td.impact',
                url:'../controllers/update_publication.php',
                title:'Impact Factor',
                type:'POST',
                validate:function(value){
                    if($.trim(value) == ''){
                        return 'This field is required';
                    }
                }
                });

                    //  hide fields
                    $('#Publication').change(function(){
        if($(this).val()=='Journal'){
          $('#data').hide();
          $('#org').hide();
          $('#lab1').hide();
          $('#lab2').hide();
          $('#role').hide();
          $('.role').hide();
           $('#doi').show();
          $('#isbn').show();
          $('#month').show();
          $('#volume').show();
          $('#pp').show();
          $('#scopus').show();
          $('#web').show();
          $('#citations').show();
          $('#hindex').show();
          $('#impact').show();
          $('.doi').show();
          $('.isbn').show();
          $('.month').show();
          $('.volume').show();
          $('.pp').show();
          $('.scopus').show();
          $('.web').show();
          $('.citations').show();
          $('.hindex').show();
          $('.impact').show();
        }else if($(this).val()=='null'){
          $('#data').show();
          $('#org').show();
          $('#lab1').show();
          $('#lab2').show();
          $('#doi').show();
          $('#isbn').show();
          $('#month').show();
          $('#volume').show();
          $('#pp').show();
          $('#scopus').show();
          $('#web').show();
          $('#citations').show();
          $('#hindex').show();
          $('#impact').show();
          $('.doi').show();
          $('.isbn').show();
          $('.month').show();
          $('.volume').show();
          $('.pp').show();
          $('.scopus').show();
          $('.web').show();
          $('.citations').show();
          $('.hindex').show();
          $('.impact').show();
        }else if($(this).val()=='Conference'){
          $('#data').show();
          $('#org').show();
          $('#lab1').show();
          $('#lab2').show();
          $('#role').show();
          $('.role').show();
          $('#doi').hide();
          $('#isbn').hide();
          $('#month').hide();
          $('#volume').hide();
          $('#pp').hide();
          $('#scopus').hide();
          $('#web').hide();
          $('#citations').hide();
          $('#hindex').hide();
          $('#impact').hide();
          $('.doi').hide();
          $('.isbn').hide();
          $('.month').hide();
          $('.volume').hide();
          $('.pp').hide();
          $('.scopus').hide();
          $('.web').hide();
          $('.citations').hide();
          $('.hindex').hide();
          $('.impact').hide();
        }else if($(this).val()=='par'){
          $('.title').hide();
          $('#title').hide();
        }
      });
            });
            // Delete Publication
            function confirmGetMessage(id) {
                    var theAnswer = confirm("Are you sure to delete?");
                    var id = id;
                    if (theAnswer){
                    $.ajax({
                        url:'../controllers/delete_publication.php',
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
