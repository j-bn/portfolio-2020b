const instaAccessToken = '1988010788.51b09fc.6b4813c0e304457c820ed71771800201';
const instaUserID = '1988010788';

// Utility functions
// -----------------

function allImagesLoaded(el) {
	$('img', el).each(function() {
		if($(this).width() == 0) {
			return false;
		}
	});

	return true;
}

// Instafeed
// ---------

var feed = new Instafeed({
	get: 'user',
	userId: instaUserID,
	accessToken: instaAccessToken,
	resolution: 'standard_resolution',
	template: '<a href="{{link}}" data-src="{{image}}"><img src="{{image}}" /></a>'
});
feed.run();

$(document).ready(function() {
	// Loaders
	// -------

	$('.to-load')
	.addClass('loading')
	.each(function() {
		console.log('Checking');

		if(allImagesLoaded(this)) {
			console.log('Already loaded');
			onLoadComplete(this);
		} else {
			$(this).on('load', onLoadComplete);
		}
	});

	function onLoadComplete(container) {
		// The load event will be called the moment all child elements of the listened element are loaded. in your case this might be before the ready event is called
		console.log('Loaded');
		$(container).removeClass('loading');
	}

	// Constant jQuery objects
	const $jobAs = $('#jobs > a');
	const $slides = $('.slide');
	const $slideContainer = $('#slide-container');

	// Job buttons
	$jobAs.click(function() {
		// Change active slide
		const slideSelector = $(this).attr('href');
		openSlide(slideSelector);

		// Apply select styles to job button
		$(this).addClass('selected');
	});

	// Only fire on bubbled-up events from slides themselves
	$slideContainer
	.on('transitionend', '.slide', hideIfTransparent)
	.on('transitionend', '#jobs > a', function(event) {
		// Block job button events from propograting up to slide level
		event.stopPropagation();
	});

	// Hide invisible slides
	$slides.each(hideIfTransparent);

	// Slide management
	// ----------------

	$('a.close-button').click(function() {
		closeSlides();
	});

	function closeSlides() {
		// Deselect all slides§
		$slides.removeClass('active');

		// Do not bother resetting job buttons here because their fade out transition would be visible as the slide fades out
	}

	function openSlide(slideSelector) {
		console.log('Opening slide ' + slideSelector);

		closeSlides();

		// Select new slide
		$(slideSelector).show().addClass('active');
	}

	function resetJobButtons() {	
		// Reset all job buttons
		console.log(' resetting job buttons');
		$jobAs.removeClass('selected');
	}

	function hideIfTransparent() {
		const $this = $(this);

		const openTag = $this[0].outerHTML.split('>')[0] + '>';
		console.log('Checking ' + openTag + ' for transparancy...');

		// Do not fire on intermediate transition ends
		const opacity = parseFloat($this.css('opacity'));
		// console.log(opacity + ':' + typeof opacity)
		if(opacity == 0) {
			// Fully hide slides once fade out complete
			console.log(' hiding');
			$this.hide();
		} else if (opacity == 1) {
			// Reset job buttons once fade in complete
			resetJobButtons();
		}
	}

	// Modal
	// -----

	$('#instafeed').magnificPopup({
		delegate: 'a',
		type: 'image',
		tLoading: 'Loading image #%curr%...',
		mainClass: 'mfp-img-mobile',
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0,1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
			titleSrc: function(item) {
				return item.el.attr('title') + '<small>by James Thornton</small>';
			}
		},
		callbacks: {
			// Pull image URL from custom attribute
			elementParse: function(item) {
				item.src = item.el.attr('data-src');
			}
		}
	});
});