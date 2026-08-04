<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <img src="logo.png" align="left" height="100" width="100"/>
    <h1 style="color:white;" align="center" font-weight="bold;"> Sri Ramakrishna Engineering College </h1>
    <h1 style="color:white;" align="center" font-weight="bold;"> Faculty Information System (FIS) </h1>
    <title>Sign in &#183; SREC FIS</title>
    <link rel="stylesheet" href="css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="login-panel panel panel-success" align="center">

        <div class="col-sm-6 col-md-5" align="center">
            <div class="thumbnail" style="padding:5%;" align="left">
                <h4>Sign in</h4>
                <hr>
                <form>
                    <div class="form-group">
                        <p>Staff id</p>
                        <input type="text" class="form-control" id="myusername" autofocus>
                    </div>
                    <div class="form-group">
                        <p>Password</p>
                        <input type="password" class="form-control" id="mypassword">
                    </div>
                    <div class="form-group">
                        <div id="login_message"></div>
                        <input type="button" class="btn btn-success btn-block" id="login_btn" name="Submit" value="Sign In">
                    </div>
                </form>
            </div>
        </div>
     </div>
  </div>
<script src="js/jquery.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/script.js"></script>
<script>
    $('#login_btn').click(function(){
    var rollno = $('#myusername').val();
    var password = $('#mypassword').val();
    $.ajax({
        url:'controllers/checklogin.php',
        method:'post',
        data:{
            username:rollno,
            password:password
        },
        beforeSend:function(){
            $('#login_btn').val('Connecting Please Wait..');
        },
        success:function(data){
            if(data == 'Successfull'){
                window.location = 'views/home.php';
            }else if(data == 'Invalid'){
                $('#login_message').html('Invalid Username or password');
                $('#login_btn').val('Sign In');
            }
        }
    })
});

</script>
</body>
<body style="background:url(1.jpg); background-repeat:no-repeat;background-size:100% 100%;height:800px;background-attachment:fixed">
</html>
