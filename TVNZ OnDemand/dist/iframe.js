const iframe = new iFrame();

iframe.on("UpdateData", () => {
  const video = document.querySelector("#vjs_video_1_html5_api");
  if (video != undefined) {
    if (!isNaN(video.duration)) {
      iframe.send({
        iFrameVideo: true,
        currentTime: video.currentTime,
        duration: video.duration,
        paused: video.paused
      });
    }
  }
});
