define(['core/helpers', 'plugins/media/video/videojs', 'text!plugins/media/video/videojs/videojs.css'],function(helpers, videojs_js, videojs_css){
	//apply the CSS
	helpers.applyStyle(videojs_css);
});