<?php 
                       require('../models/dbcon.php');
                       $sql = mysqli_query($conn,"select a.Department,i.staff_id,i.staff_name,i.dob,i.gender,i.address,i.mobile,i.email,i.pan,i.aadhar,i.type from staff_academics a,staff_personal i where a.staff_id=i.staff_id and a.Department='".$_POST['dept']."'");
                       while($row = mysqli_fetch_array($sql))
                       {
                        $sid = $row['staff_id'];
                        $name = $row['staff_name'];
                        $dob = $row['dob'];
                        $gen = $row['gender'];
                        $add = $row['address'];
                        $mob = $row['mobile'];
                        $email = $row['email'];
                        $pan = $row['pan'];
                        $aad = $row['aadhar'];
                        $typ = $row['type'];
                        ?>
                        <tbody>
                        <td><?php echo $sid?></td>
                        <td><?php echo $name?></td>
                        <td><?php echo $dept?></td>
                        <td><?php echo $dob?></td>
                        <td><?php echo $gen?></td>
                        <td><?php echo $add?></td>
                        <td><?php echo $mob?></td>
                        <td><?php echo $email?></td>
                        <td><?php echo $pan?></td>
                        <td><?php echo $aad?></td>
                        <td><?php echo $typ?></td>
                        </tbody>
                        <?php
                       }?>
                    <tbody id="personal_data"></tbody>
                </table>
            </div>
            