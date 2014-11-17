/*
    Author: Mephasto
*/
$(document).ready(function() {
    'use strict';

    $('#datepicker').datepicker();
    $('#datepicker-b').datepicker();

    $('.fold').on('click', function(){
    	$('.un-fold').removeClass('un-fold');
    	$('.folder').addClass('fold');
    	$(this).removeClass('fold');
    	$(this).addClass('un-fold');
    });

    $('.folder .list-group').each(function (index, value){
    	var count = $(this).children('.list-group-item').length;
    	$(this).closest('ul.A').find('span.badge').html(count);
    })

    $('#admin-files').on('click', function(){
    	if($('.list-all-folders').is(':visible')){
    		$('.add-new-file').show();
    		$('.list-all-files').show();
    		$('.list-all-folders').hide();
    		$(this).html("Volver al listado")
    		console.log('si');
    	}else{
    		$('.add-new-file').hide();
    		$('.list-all-files').hide();
    		$('.list-all-folders').show();
    		$(this).html("Subir nuevo archivo")
    		console.log('no');
    	}
    })
});
