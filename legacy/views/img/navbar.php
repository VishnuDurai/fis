<!DOCTYPE html>
<html>
<head>
  <title></title>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.5/angular.min.js"></script>
 <script
  src="http://code.jquery.com/jquery-2.2.4.js"
  integrity="sha256-iT6Q9iMJYuQiMWNd9lDyBUStIq/8PuOW33aOqmvFpqI="
  crossorigin="anonymous"></script>
</head>
<body>
<nav class="navbar navbar-toggleable-md navbar-inverse bg-faded" style="background-color: #682D87;">
  <button class="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarNavDropdown">
    <ul class="navbar-nav">
      <li class="nav-item active">
        <a class="nav-link" href="staff.php">Home <span class="sr-only">(current)</span></a>
      </li>
      <li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          General
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="personal.php">Personal</a>
          <a class="dropdown-item" href="edu_test.php">Eduaction</a>
          <a class="dropdown-item" href="academics.php">Academics</a>
          <a class="dropdown-item" href="professional.php">Professional</a>
          <a class="dropdown-item" href="view_pan.php">View Aadhar</a>
          <a class="dropdown-item" href="view_aad_pan.php">View Pan</a>
          <a class="dropdown-item" href="checkod.php">Check OD</a>
          <a class="dropdown-item" href="checkodconf.php">Check OD Conference</a>



        </div>
      </li>
      <li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Faculty Activity
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="interaction_test.php">Interaction Details</a>
          <a class="dropdown-item" href="publication_test.php">Publication</a>
          <a class="dropdown-item" href="bookpublished_test.php">Book Published</a>
          <a class="dropdown-item" href="resource_test.php">Resource Person</a>
          <a class="dropdown-item" href="award_test.php">Award</a>
          <a class="dropdown-item" href="ipr_test.php">Intellectual Property Right</a>
          <a class="dropdown-item" href="certificate_test.php">Online Certification Detail</a>
          <a class="dropdown-item" href="competitive_test.php">Competitive exam</a>
          <a class="dropdown-item" href="innovative_test.php">Innovative project</a>
        </div>
      </li>
      <li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Research
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="development_test.php">Research and Development</a>
          <a class="dropdown-item" href="scholar_test.php">Research scholars</a>
          <a class="dropdown-item" href="supervisor_test.php">Research Supervisor</a>
        </div>
      </li>
      <li class="nav-item active">
        <a class="nav-link" href="eventorganized_test.php">Events Organized</a>
      </li>
      <li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Club Activities
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="clubactivity.php">Club Activity</a>
          <a class="dropdown-item" href="add_club.php">Add New Club</a>
        </div>
      </li>
     <!-- <li class="nav-item active">
        <a class="nav-link" href="manage-profile.php">Manage your Profile</a>
      </li>-->
       <li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Manage
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="manage-profile.php">Manage your Profile</a>
          <a class="dropdown-item" href="add_user.php">Add New User</a>
          <a class="dropdown-item" href="exe_user.php">Mange Existing User </a>
          <a class="dropdown-item" href="add_pro.php">Add New Organization</a>
          <a class="dropdown-item" href="add_cat.php">Add New Degree</a>
          <a class="dropdown-item" href="add_spe.php">Add New Specialization</a>
          <a class="dropdown-item" href="add_bod.php">Add New University/Board</a>
        </div>
      </li>
      <li class="nav-item dropdown active">
        <a class="nav-link dropdown-toggle" href="http://example.com" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Report
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
          <a class="dropdown-item" href="personaltable.php">Personal</a>
          <a class="dropdown-item" href="academicstable.php">Academics</a>
          <a class="dropdown-item" href="professionaltable.php">Professional</a>
          <a class="dropdown-item" href="interactiontable.php">Staff Interaction</a>
          <a class="dropdown-item" href="jpublicationtable.php">Journal Publication</a>
          <a class="dropdown-item" href="cpublicationtable.php">Conference Publication</a>
          <a class="dropdown-item" href="bookpublishedtable.php">Book Published</a>
          <a class="dropdown-item" href="resourcetable.php">Resource Person</a>
          <a class="dropdown-item" href="awardtable.php">Award</a>
          <a class="dropdown-item" href="iprtable.php">Intellectual Property Right</a>
          <a class="dropdown-item" href="certificatetable.php">Online Certification Details</a>
          <a class="dropdown-item" href="researchtable.php">Research and Development</a>
          <a class="dropdown-item" href="scholartable.php">Research scholars</a>
          <a class="dropdown-item" href="supervisortable.php">Research Supervisor</a>
          <a class="dropdown-item" href="eventtable.php">Event Organized</a>
          <a class="dropdown-item" href="clubtable.php">Club Activities</a>
          <a class="dropdown-item" href="staff_list.php">Staff List</a>
          <a class="dropdown-item" href="individual_list.php">Individual Staff</a>

        </div>
      </li>
      <li class="nav-item active">
        <a class="nav-link" href="About.php">About Us</a>
      </li>
      <li class="nav-item active">
        <a class="nav-link" href="logout.php">Logout</a>
      </li>

    </ul>
  </div>
</nav>
</body>
</html>
