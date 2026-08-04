<?php require('../models/restrict.php');?>
<!DOCTYPE html>
<html class="no-js" ng-app>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Appraisal Form &#183; SRECIMS</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="../css/bootstrap.min.css">
        <link rel="stylesheet" href="../css/style.css">
        <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.min.js"></script>
    </head>
    <body>
    <?php include('../views/navbar.php');?>
        <div class="container">
        <div class="row">
        <div class="col-md-4">

          <div class="form-group">
            <label for="name">1. Name & Highest Qualification with Designation:</label>
            <input type="text" class="form-control col-sm-1" name="name" ng-model="name">
           </div>
           <div class="form-group">
            <label for="dept">Department:</label>
            <input type="text" class="form-control col-sm-1" name="dept" ng-model="dept">
           </div>
           <div class="form-group">
            <label for="dob">2. Date of Birth :</label>
            <input type="date" class="form-control col-sm-1" name="dob" ng-model="dob">
           </div>
           <div class="form-group">
           <label for="age">Age</label>
           <input type="number" class="form-control col-sm-1" name="age" ng-model="age">
           </div>
           <div class="form-group">
            <label for="doj">3. Date of Joining:</label>
            <input type="date" class="form-control col-sm-1" name="doj" ng-model="doj">
           </div>
           <div class="form-group">
           <label for="pre">Previous Experience</label>
           <input type="text" class="form-control col-sm-1" name="pre" ng-model="pre">
           </div>
           <div class="form-group">
            <label for="ay">4. Academic year of Report:</label>
            <div class="form-group">
            <label for="ay_from">From</label>
            <input type="date" class="form-control col-sm-1" name="ay_from" ng-model="ay_from"></div>
            <label for="to">To</label>
            <input type="date" class="form-control col-sm-1" name="ay_to" ng-model="ay_to">
           </div>
           <div class="form-group">
            <label for="aa">5. Academic semester:</label>
            <div class="form-group">
            <label for="aa_from">From</label>
            <input type="date" class="form-control col-sm-1" name="aa_from" ng-model="aa_from"></div>
            <div class="form-group">
            <label for="aa_to">To</label>
            <input type="date" class="form-control col-sm-1" name="aa_to" ng-model="aa_to"></div>
            <label for="sem">semester</label>
            <input type="text" class="form-control col-sm-1" name="sem" ng-model="sem">
           </div><br><br>
    <!--Table start-->
    <label>Results produced in the last semester / year	:</label>
    <div class="form-group">
        <label for="class">(a) Class ( Prog., Branch, Sem / Year & Section)</label>
        <div class="form-inline">
            Subject 1:    <input type="text" class="form-control" style="width:100px;" ng-model="class1_sb1">
            Subject 2:   <input type="text" class="form-control" style="width:100px;" ng-model="class1_sb2">
            Subject 3:    <input type="text" class="form-control" style="width:100px;" ng-model="class1_sb3">
            Subject 4:   <input type="text" class="form-control" style="width:100px;" ng-model="class1_sb4">
        </div>
    </div>
    <div class="form-group">
        <label for="class">(b) Name of subject handled </label>
        <div class="form-inline">
            Subject 1:    <input type="text" class="form-control" style="width:100px;" ng-model="class2_sb1">
            Subject 2:   <input type="text" class="form-control" style="width:100px;" ng-model="class2_sb2">
            Subject 3:    <input type="text" class="form-control" style="width:100px;" ng-model="class2_sb3">
            Subject 4:   <input type="text" class="form-control" style="width:100px;" ng-model="class2_sb4">
        </div>
    </div>
    <div class="form-group">
        <label for="class">(c) No. of periods handled & % of portions Completed.  </label>
        <div class="form-inline">
            Subject 1:    <input type="text" class="form-control" style="width:100px;" ng-model="class3_sb1">
            Subject 2:   <input type="text" class="form-control" style="width:100px;" ng-model="class3_sb2">
            Subject 3:    <input type="text" class="form-control" style="width:100px;" ng-model="class3_sb3">
            Subject 4:   <input type="text" class="form-control" style="width:100px;" ng-model="class3_sb4">
        </div>
    </div>
    <div class="form-group">
        <label for="class">(d) No of Students in class  </label>
        <div class="form-inline">
            Subject 1:    <input type="text" class="form-control" style="width:100px;" ng-model="class4_sb1">
            Subject 2:   <input type="text" class="form-control" style="width:100px;" ng-model="class4_sb2">
            Subject 3:    <input type="text" class="form-control" style="width:100px;" ng-model="class4_sb3">
            Subject 4:   <input type="text" class="form-control" style="width:100px;" ng-model="class4_sb4">
        </div>
    </div>
    <div class="form-group">
        <label for="class">(e) Percentage of Passes </label>
        <div class="form-inline">
            Subject 1:    <input type="text" class="form-control" style="width:100px;" ng-model="class5_sb1">
            Subject 2:   <input type="text" class="form-control" style="width:100px;" ng-model="class5_sb2">
            Subject 3:    <input type="text" class="form-control" style="width:100px;" ng-model="class5_sb3">
            Subject 4:   <input type="text" class="form-control" style="width:100px;" ng-model="class5_sb4">
        </div>
    </div>

    <div class="form-group">
        <label for="class">(f) Percentage of Passes & Average % of  marks at the University level (if available)  </label>
        <div class="form-inline">
            Subject 1:    <input type="text" class="form-control" style="width:100px;" ng-model="class6_sb1">
            Subject 2:   <input type="text" class="form-control" style="width:100px;" ng-model="class6_sb2">
            Subject 3:    <input type="text" class="form-control" style="width:100px;" ng-model="class6_sb3">
            Subject 4:   <input type="text" class="form-control" style="width:100px;" ng-model="class6_sb4">
        </div>
    </div>
    <!--Table end-->
<br>

           <div class="form-group">
            <label for="theory">6. Theory Classes</label>
            <div class="form-group">
                <label for="ino">(a)Innovative methods used in the class</label>
                <input type="text" class="form-control col-sm-1" name="ino" ng-model="ino">
            </div>
            <div class="form-group">
                <label for="int">(b)Did the Students interact with you?If so on what matter</label>
               <select name="int" ng-model="int">
                    <option>Yes</option>
                    <option>No</option>
               </select>
            </div>
            <div class="form-group">
               <input type="text" class="form-control col-sm-1" name="wat" ng-model="wat">
            </div>
            <div class="form-group">
                <label for="con">(c)Did you have the good control over the class?</label>
               <select name="con" ng-model="con">
                    <option>Yes</option>
                    <option>No</option>
               </select>
            </div>
            <div class="form-group">
                <label for="ext">(d)Did you take any extra training classes?</label>
               <select name="ext" ng-model="ext">
                    <option>Yes</option>
                    <option>No</option>
               </select>
            </div>
            <div class="form-group">
               <input type="text" class="form-control col-sm-1" name="wat_ext" ng-model="wat_ext">
            </div>
            <div class="form-group">
                <label for="content">(e)Content beyond the syllabus taught, Specific the topic covered and relevance</label>
               <select name="content" ng-model="content">
                    <option>Yes</option>
                    <option>No</option>
               </select>
            </div>
            <div class="form-group">
               <input type="text" class="form-control col-sm-1" name="wat_content" ng-model="wat_content">
            </div>
        </div>
            <div class="form-group">
                <label for="lab">7. Laboratory Classes</label>
                <div class="form-group">
                    <label for="ses">(a)No. of Sessions Conducted and planned</label>
                    <input type="text" class="form-control col-sm-1" name="no_ses" ng-model="no_ses">
                </div>
                <div class="form-group">
                    <label for="exp">(b)No. of Experiments completed</label>
                    <input type="text" class="form-control col-sm-1" name="no_exp" ng-model="no_exp">
                </div>
                <div class="form-group">
                    <label for="exp_bey">(c)Experiment beyond Content/mini projects conducted:</label>
                    <input type="text" class="form-control col-sm-1" name="exp_bey" ng-model="exp_bey">
                </div>
            </div>
            <div class="form-group">
                <label for="no_days">8. No. of days attended</label>
                <div class="form-group">
                <input type="text" class="form-control col-sm-1" name="no_days" ng-model="no_days">
                </div>
                <label for="no_work">No. of working days</label>
                <div class="form-group">
                <input type="text" class="form-control col-sm-1" name="no_work" ng-model="no_work">
                </div>
            </div>
            <div class="form-group">
            <label for="9">9.</label>
                <label for="proficient">(a) whether proficient with relevant rules and regulation on students and staff of SREC?</label>
                <select name="proficient"ng-model="proficient">
                    <option>Yes</option>
                    <option>No</option>
                </select>
            </div>
            <div class="form-group">
                <label for="regular">(b) whether regular maintaining record?</label>
                <select name="regular"ng-model="regular">
                    <option>Yes</option>
                    <option>No</option>
                </select>
            </div>

            <div class="form-group">
            <label for="10">10.</label>
                <label for="memos">(a) Any memos of reproach served by higher officers?</label>
                <input type="text" class="form-control col-sm-1" name="memos" ng-model="memos">
            </div>
            <div class="form-group">
                <label for="disciple">(b) Any disciplinary actions faced?</label>
                <input type="text" class="form-control col-sm-1" name="disciple" ng-model="disciple">
            </div>
            <div class="form-group">
                <label for="previous_app">11.Previous appraisal held:</label>
                <input type="date" name="previous_app" class="form-control col-sm-1" ng-model="previous_app">
            </div>
            <br><br><div class="form-group">
            <a href="javascript:void(0);" id="print_button2"><button class="btn btn-success" style="cursor:pointer;">Download and Print</button></a>
            <a href="staff.php"><button class="btn btn-danger" style="cursor:pointer;">Back</button></a>
            </div>
        </div>
        <div class="col-md-8">
            <div class="container">
<div class="wrapper">
<div class="content">
<center>
<div class="col-md-12">
  <table class="offset-sm-2" cellspacing='1' cellpadding='1' border='0'>
   <tr valign='top'>
     <div class="col-md-6">
     <td>
                 <p><img src='../views/img/header.png' border='0'></p>
     </td>
     </div>
     <!-- <div class="col-md-6">
     <td align='left' nowrap><div align="center">
       <p><span class='bgcolor' style ='color: black; font-family: verdana, arial; font-size: 12.0pt; font-weight: bold'>SRI RAMAKRISHNA ENGINEERING COLLEGE</span>
         <br>
         <span class='bgcolor' style ='color: black; font-family: arial, verdana; font-size: 8pt; font-weight: bold; margin-left: 2px'>
           [Educational Service: SNR Sons Charitable Trust]<br>
[Autonomous Institution, Accredited by NAAC with 'A' Grade] [Approved by AICTE and Permanently Affiliated to Anna University, Chennai]<br>
[ISO 9001-2008 Certified and all eligible programmes Accredited by NBA]<br>
VATTAMALAIPALAYAM, N.G.G.O. COLONY POST, COIMBATORE - 641 022.
           </span>

         <br>
           </div>
           </div>
     </td>
     </div>
     <div class="col-md-3">
<td align='right'><p><img src='../views/img/logo.png' width="100" height="75" border='0'></p>
         </td>
         </div> -->
   </tr>
 </table></div></center>

<center><label for="dept">Department:</label>{{dept}}</center>
 </center>
    <label for="name">1.Name & Highest Qualification with Designation :</label> {{name}}<br><br>
    <label for="dob">2.Date of Birth & Age :</label> {{dob | date}} & {{age}} yr<br><br>
    <label for="doj">3.Date of Joining & Previous Experience :</label> {{doj | date}} & {{pre}} yr<br><br>
    <label for="ay">Academic year of Report: </label> {{ay_from | date : "y"}} - {{ay_to | date : "y"}}
    &nbsp;&nbsp;&nbsp;<label for="aa">Academic semester: </label> {{aa_from | date : "y"}} - {{aa_to | date : "y"}} ({{sem}})
       <br><br> <label for="table">Results produced in the last semester / year	:</label>
    <table class="table table-sm table-bordered">
        <tr>
            <th></th>
            <th>Subject 1</th>
            <th>Subject 2/Lab</th>
            <th>Subject 3/Lab</th>
            <th>Subject 4/Lab</th>
        </tr>
        <tr>
        <tr>
            <th>(a) Class ( Prog., Branch, Sem / Year &  Section).</th>
            <td>{{class1_sb1}}</td>
            <td>{{class1_sb2}}</td>
            <td>{{class1_sb3}}</td>
            <td>{{class1_sb4}}</td>

        </tr>
        <tr>
            <th>(b) Name of subject handled </th>
            <td>{{class2_sb1}}</td>
            <td>{{class2_sb2}}</td>
            <td>{{class2_sb3}}</td>
            <td>{{class2_sb4}}</td>
        </tr>
        <tr>
            <th>(c) No. of periods handled & % of portions Completed. </th>
            <td>{{class3_sb1}}</td>
            <td>{{class3_sb2}}</td>
            <td>{{class3_sb3}}</td>
            <td>{{class3_sb4}}</td>
        </tr>
        <tr>
            <th>(d) No of Students in class </th>
            <td>{{class4_sb1}}</td>
            <td>{{class4_sb2}}</td>
            <td>{{class4_sb3}}</td>
            <td>{{class4_sb4}}</td>
        </tr>
        <tr>
            <th>(e) Percentage of Passes</th>
            <td>{{class5_sb1}}</td>
            <td>{{class5_sb2}}</td>
            <td>{{class5_sb3}}</td>
            <td>{{class5_sb4}}</td>
        </tr>
        <tr>
            <th>(f) Percentage of Passes & Average % of  marks at the University level (if available)</th>
            <td>{{class6_sb1}}</td>
            <td>{{class6_sb2}}</td>
            <td>{{class6_sb3}}</td>
            <td>{{class6_sb4}}</td>
        </tr>

    </table>
    <label>5. Theory Classes</label><br>
    &nbsp;&nbsp;&nbsp;<label>(a)Mention innovative methods,if any used by you in the class :</label> {{ino}}<br><br>
    &nbsp;&nbsp;&nbsp;<label>(b)Did the student interact with you? If so on what matters? :</label> {{int}} , {{wat}}<br>
    &nbsp;&nbsp;&nbsp;<label>(c)Did you have a good control over training class? :</label> {{con}}<br>
    &nbsp;&nbsp;&nbsp;<label>(d)Did you take any extra training classes? :</label> {{ext}}, {{wat_exp}}<br>
    &nbsp;&nbsp;&nbsp;<label>(e)Content beyond syllabus taught - <br>&nbsp;&nbsp;Specify the Topics covered and relevance:</label> {{content}} , {{wat_content}}
    <br><br> <label>6. Laboratory Classes</label><br>
    &nbsp;&nbsp;&nbsp;<label>(a)No. of Sessions conducted and planned :</label> {{no_ses}} sessions Per Batch<br>
    &nbsp;&nbsp;&nbsp;<label>(b)No. of Experiments completed :</label> {{no_exp}} Experiments<br>
    &nbsp;&nbsp;&nbsp;<label>(c)Experiments beyond contents mini projects conducted :</label> {{exp_bey}}<br><br>
     <label>7. No. of days attended & No. of working days :</label>{{no_days}} days out of {{no_work}} days<br>
    <label>8. (a) whether proficient with relevant rules and regulation on students and staff of SREC?:</label> {{proficient}}<br>
    <label>(b) Whether regularly maintaining records on self and the department activities<br>&nbsp; Entrusted by higher officers and in consequence of the position held?:</label> {{regular}}<br>
    <label>9. (a)Any memos of reproach served by higher officers? :</label> {{memos}}<br>
    <label> &nbsp;&nbsp;(b)Any disciplinary actions faced? :</label> {{disciple}}<br>
    <label>10. Previous appraisal held : </label> {{previous_app | date}}<br>
    <div class="col-md-9">
    </div>
    <div class="col-md-3" style="float:right;">
    Signature of Faculty<br>
    Date:
    </div>
    <br><br><br><table class="table table-sm table-bordered">
        <tr>
            <th>Section</th>
            <th>Category</th>
            <th>Mark</th>
            <th>Signature</th>
        </tr>
        <tr>
            <th>B</th>
            <th>Students feedback, reduced to 15%</th>
            <th></th>
            <th style="color:lightgrey">FA</th>
        </tr>
        <tr>
            <th>C</th>
            <th>Performance appraisal by HOD using the data given by
             Faculty and his own observations for 50 %
            </th>
            <th></th>
            <th style="color:lightgrey">HOD</th>
        </tr>
        <tr>
            <th>D</th>
            <th>Performance appraisal by Principal for 35% </th>
            <th></th>
            <th style="color:lightgrey">PRINCIPAL</th>
        </tr>
    </table>
    <br>
    <label>Total : </label>--------------------------------------------------------
            </div>
        </div>
    </div>
    </div>
    </div>
        </div>
        <script src="../js/jquery.min.js"></script>
        <script src="../js/bootstrap.min.js"></script>
        <script src="../js/script.js"></script>
        <script src="../js/jquery.PrintArea.js" type="text/JavaScript" language="javascript"></script>
        <script>
    $(document).ready(function(){
        $("#print_button1").click(function(){
            var mode = 'iframe'; // popup
            var close = mode == "popup";
            var options = { mode : mode, popClose : close};
            $("div.wrapper").printArea( options );
        });
         $("#print_button2").click(function(){
            var mode = 'iframe'; // popup
            var close = mode == "popup";
            var options = { mode : mode, popClose : close};
            $("div.content").printArea( options );
        });
    });
    </script>
    </body>
</html>
