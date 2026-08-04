<html>
<head>
<link href="bootstrap-3.3.7-dist\css\bootstrap.css" rel="stylesheet" type="text/css"/>
<script language="JavaScript" src="bootstrap-3.3.7-dist\js\bootstrap.js"></script>
<title>Sign in &#183; SREC FIS &#183; ADMIN</title>
</head>
<style type="text/css">

  .login-panel{
    margin-top: 70px;
  }
  .btn-panel{
    margin-left: 270px;
  }
  h1,h2{
    text-align:center;
  }
  h1{
    color:rgba(100, 50, 255, .8);
  }

  .rainbow {

     /* Chrome, Safari, Opera */
    -webkit-animation: rainbow 1s infinite;

    /* Internet Explorer */
    -ms-animation: rainbow 1s infinite;

    /* Standar Syntax */
    animation: rainbow 1s infinite;
  }

  /* Chrome, Safari, Opera */
  @-webkit-keyframes rainbow{
  	20%{color: red;}
  	40%{color: yellow;}
  	60%{color: green;}
  	80%{color: blue;}
  	100%{color: orange;}
  }
  /* Internet Explorer */
  @-ms-keyframes rainbow{
  	20%{color: red;}
  	40%{color: yellow;}
  	60%{color: green;}
  	80%{color: blue;}
  	100%{color: orange;}
  }

  /* Standar Syntax */
  @keyframes rainbow{
  	20%{color: red;}
  	40%{color: yellow;}
  	60%{color: green;}
  	80%{color: blue;}
  	100%{color: orange;}
  }
  body{
    background-image: url(http://fjordstudio.dk/assets/img/bg/diamonds.png);
  }

</style>
<body style="background:url(images/1.jpg); background-repeat:no-repeat;background-size:100% 100%;height:800px;background-attachment:fixed">

  <div id="page">
    <div id="header">
    <<center><b><font style="color: #176281;" size="6">ADMIN</font></b></center>
  </div>
  <div class="container">
      <div class="row">
          <div class="col-md-4 col-md-offset-4">
              <div class="login-panel panel panel-success">

                  <div class="panel-heading">
                  <a>&nbsp;</a>
                      <h3 class="panel-title">SREC Welcomes you! ADMIN SIGN</h3>
                  </div>
                  <div class="panel-body">
                      <form name="form1" method="post" action="checklogin.php" onSubmit="return loginValidate(this)">
                          <fieldset>
                          <a>&nbsp;</a>
                              <div class="form-group"  >
                                  <input class="form-control" placeholder="Staff_ID" name="myusername" type="text" autofocus>
                              </div>
                              <div class="form-group">
                                  <input class="form-control" placeholder="Password" name="mypassword" type="password" value="">
                              </div>
                              <input class="btn btn-lg btn-success btn-block" type="submit" value="Login" name="Submit" >
                              <center>
                                <b>Powered By&nbsp;<label class="rainbow" style="font-family:'Monotype Corsiva'; "><h2>CSE</h2></label>
                              </center>
                            </fieldset>
                      </form>

                  </div>
              </div>
          </div>
      </div>
  </div>
</body>
</html>
