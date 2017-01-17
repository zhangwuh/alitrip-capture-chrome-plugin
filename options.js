$(function(){
	$('#savebtn').click(function(){
		save();
	});
	$('#pushto').val(localStorage["pushto"]);
	$('#host').val(localStorage["host"]); 
	$('#pattern').val(localStorage["pattern"]);
	$('#interval').val(localStorage["interval"]);
});



function save(){
	localStorage["pushto"] = $('#pushto').val();
	localStorage["host"] = $('#host').val();
	localStorage["pattern"] = $('#pattern').val();
	localStorage["interval"] = $('#interval').val();
	alert("settings updated");
}