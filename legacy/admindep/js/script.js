function fetch_academics(){
    $.ajax({
        url:'../controllers/fetch_academics.php',
        method:'post',
        dataType:'json',
        success:function(data){
            for(c=0;c<data.length;c++){
                $('#staff_id').val(data[c].staff_id);
                $('#Department').val(data[c].Department);
            }
        }
    });
}
fetch_academics();
