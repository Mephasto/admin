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
});
