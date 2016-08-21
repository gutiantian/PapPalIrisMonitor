var modal = document.getElementById('myModal');
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    modal.style.display = "none";
    $(".modal-body").val(null); 
   // check = false;
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}