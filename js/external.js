$(document).ready(function() {
	var url = window.location.hash.substring(1);

	$('#portal').attr('src', url);
	$('#link').attr('href', url);
	$('#link > h2').html(url);
});