function fetch_personal(){
    $.ajax({
        url:'../controllers/fetch_personal.php',
        method:'post',
        dataType:'json',
        success:function(data){
            for(c=0;c<data.length;c++){
                $('#staff_id').val(data[c].staff_id);
                $('#staff_name').val(data[c].staff_name);
            }
        }
    });
}
fetch_personal();
