function initPlayer(src){
var video=document.getElementById('movie-player');
var overlay=document.querySelector('.player-overlay');
var started=false;
function bind(){
if(started||!video)return;
started=true;
if(overlay)overlay.classList.add('is-hidden');
if(video.canPlayType('application/vnd.apple.mpegurl')){video.src=src}else if(window.Hls&&window.Hls.isSupported()){var hls=new window.Hls({enableWorker:true,lowLatencyMode:true});hls.loadSource(src);hls.attachMedia(video)}else{video.src=src}
var p=video.play();if(p&&p.catch)p.catch(function(){})
}
if(overlay)overlay.addEventListener('click',bind);
if(video)video.addEventListener('click',function(){if(!started)bind()});
}