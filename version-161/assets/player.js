/* HLS player bootstrap. Uses the uploaded HLS module and keeps the visible player static until clicked. */

import { H as Hls } from './hls-dru42stk.js';

function setMessage(player, message) {
    let messageBox = player.querySelector('[data-player-message]');

    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.className = 'video-message';
        messageBox.setAttribute('data-player-message', '');
        player.appendChild(messageBox);
    }

    messageBox.textContent = message;
}

function preparePlayer(player) {
    const video = player.querySelector('video');
    const source = player.dataset.videoSrc;
    const poster = player.querySelector('[data-video-poster]');
    let hlsInstance = null;
    let loaded = false;

    if (!video || !source || !poster) {
        return;
    }

    function startPlayback() {
        if (!loaded) {
            loaded = true;
            player.classList.add('is-playing');
            setMessage(player, '正在加载播放源，请稍候…');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.ERROR, function (_, data) {
                    if (data && data.fatal) {
                        setMessage(player, '播放源加载失败，请刷新页面后重试。');
                    }
                });
            } else {
                setMessage(player, '当前浏览器暂不支持 HLS 播放，请使用最新版 Chrome、Edge 或 Safari。');
                return;
            }
        }

        video.play().then(function () {
            const messageBox = player.querySelector('[data-player-message]');
            if (messageBox) {
                messageBox.remove();
            }
        }).catch(function () {
            setMessage(player, '浏览器阻止了自动播放，请再次点击播放器或使用视频控件播放。');
        });
    }

    poster.addEventListener('click', startPlayback);
    player.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}

document.querySelectorAll('[data-player]').forEach(preparePlayer);
