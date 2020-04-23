const instaAccessToken = '1988010788.51b09fc.6b4813c0e304457c820ed71771800201';
const instaUserID = '1988010788';

const eventsTransitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';

const isTouchDevice = "ontouchstart" in window || navigator.msMaxTouchPoints;

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

// Loader
// ------

$(window).on('load', function() {
	$('body > .loader').addClass('loaded');
});

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

// Projects
// --------

function applyProjectsTitleAlign() {
	// Should match transform scale in CSS
	var scaleFactor = 2;

	var nextID = 0;

	$('.projects > li')
	.each(function() {
		var $panel = $(this), $title = $('h3', this);

		// Measures content height
		var boxHeight = $panel.height();

		// Measures outer height (including padding and border but by default not margin)
		// before transform is applied
		var titleHeight = $title.outerHeight();
		var titleHeightScaled = titleHeight * scaleFactor;

		var yOffset = (boxHeight - titleHeightScaled) / 2;

		// console.log(`${boxHeight} ${titleHeight}`);

		var className = 'project-' + nextID;
		$panel.addClass(className);
		nextID ++;

		var css = `.${className} > h3 { top: ${yOffset}px; }`;
		$('style').append(css);
	});
}

$(document).ready(function() {

	// Event listeners
	// ---------------

	// Constant jQuery objects
	const $jobAs = $('#jobs > a');
	const $slides = $('.slide');
	const $slideContainer = $('#slide-container');

	// Job buttons
	$jobAs.click(function() {
		// Change active slide
		// (no longer required because openSlide is called by hash change)
		// const slideSelector = $(this).attr('href');
		// openSlide(slideSelector);

		// Apply select styles to job button
		$(this).addClass('selected');
	});

	// Only fire on bubbled-up events from slides themselves
	$slideContainer.on(eventsTransitionEnd, '.slide', hideIfTransparent);

	// Hide invisible slides
	$slides.each(hideIfTransparent);

	// Open slides from URLs
	// ---------------------

	if(window.location.hash) {
		// Remove hash character from string
		var hash = window.location.hash.substring(1);

		openSlide(window.location.hash);
	}

	// Navigation / history / back button
	$(window).on('hashchange', function() {
		var hash = window.location.hash;
		if(hash == "#") {
			closeSlides();
		} else {
			openSlide(hash);
		}
	});

	// External links
	// --------------

	$('.projects > li').click(function() {
		var link = $(this).attr('data-href');

		// Start effect
		$('h3', this).addClass('after-expand');

		// Go to link
		window.location.href = isTouchDevice ? link : 'external.html#' + link;

		// Block bubbling and defaults
		return false;
	})

	// Slide management
	// ----------------

	$('a.close-button').click(function() {
		window.location.hash = '';
		closeSlides();
	});

	function closeSlides() {
		// Show landing slide
		$('.slide#landing').show();

		// Deselect all slides
		$slides.removeClass('active');

		// Do not bother resetting job buttons here because their fade out transition would be visible as the slide fades out
	}

	function openSlide(slideSelector) {
		console.log('Opening slide ' + slideSelector);

		closeSlides();

		// Select new slide
		$(slideSelector).show().addClass('active');

		// Apply fixes reliant on being visible
		if(slideSelector == '#web') {
			applyProjectsTitleAlign();
		}
	}

	function resetJobButtons() {	
		// Reset all job buttons
		console.log(' resetting job buttons');
		$jobAs.removeClass('selected');
	}

	function hideIfTransparent(event) {
		const $this = $(this);

		// Only operate on non-bubbled events or direct
		// (event will usually be an integer)
		if(typeof event != 'object' || event.target == this) {

			const openTag = $this[0].outerHTML.split('>')[0] + '>';
			console.log('Checking ' + openTag + ' for transparancy...');

			// job button gets .selected
			// -> openSlide()
			// close all other slides by removing .active
			// un-hide new slide
			// add .active

			// on transition end from a slide
			// -> hideIfTransparent()
			// 

			// Do not fire on intermediate transition ends
			const opacity = parseFloat($this.css('opacity'));
			if(opacity == 1 && $this.hasClass('active')) {

				// Reset job buttons once fade in complete
				resetJobButtons();

				// Hide landing slide once fade in complete
				$('.slide#landing').hide();

			} else if(opacity == 0 && $this.attr('id') != 'landing') {

				// Fully hide slides once fade out complete
				console.log(' hiding slide');
				$this.hide();

			}

		}
	}

	// Modal
	// -----

	if(isTouchDevice) {
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
				tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
			},
			callbacks: {
				// Pull image URL from custom attribute
				elementParse: function(item) {
					item.src = item.el.attr('data-src');
				}
			}
		});
	}

	// Touchscreen pseudo-hover
	// ------------------------

	if(isTouchDevice) {
		$(window).scroll(function() {
			var scrollY = $(this).scrollTop();
			var windowH = $(window).height();
			var midY = scrollY + windowH / 2;

			$('[data-touch-hover]').each(function() {
				var $container = $(this);
				var mode = $container.attr('data-touch-hover');

				var containerYTop = $container.offset().top;
				var containerH = $container.height();
				var containerN = $container.children().length;
				var uniformH = containerH / containerN;

				$container.children().each(function(i) {
					var $this = $(this);

					var regionYTop, regionYBottom;
					if(mode == "direct") {
						regionYTop = $this.offset().top;
						regionYBottom = regionYTop + $this.outerHeight();;
					} else {
						var scale = mode == "uniform" ? 1 : parseFloat(mode);

						var scaleShift = (scale - 1) * containerH / 2;

						regionYTop = containerYTop - scaleShift + uniformH * i * scale;
						regionYBottom = containerYTop - scaleShift + uniformH * (i + 1) * scale;
					}

					var simulateHover = midY >= regionYTop && midY <= regionYBottom;

					// console.log($container.attr('class') + ' ' + i + ': ' + regionYTop + ' - ' + regionYBottom);

					$this.toggleClass('touch-hover', simulateHover);
				});
			});
		});
	}
});