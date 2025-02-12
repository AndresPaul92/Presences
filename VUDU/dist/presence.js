// Initialize the presence
var presence = new Presence({
  clientId: "697983563857002517"
});

// Global variables
var startTime = Date.now();

var videoPlayer;
var videoDuration;
var cuTime;

var endTime;
var videoState = "paused"; // Default

var metadata;

// Set the default presence data for when the video is loading
var presenceData = {
  largeImageKey:
    "vudularge" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
  details: "Browsing VUDU"
};

// Get the title
function grabMetadata() {
  // Get the close button first (Don't worry this will make sense)
  var closeButton = document.querySelector('[aria-label="Close"]');

  // If there's not a close button, then the user isn't watching anything
  if (!closeButton) return;

  // Get the parent
  var metaParent = closeButton.parentElement;

  // Get all the elements inside of the parent that are span (there should only be one) and get the innerHTML
  metadata = metaParent.getElementsByTagName("span")[0].innerHTML;
}

// Get the video player element
function getVideoPlayer() {
  // VUDU plays movies in an iFrame. Cool! Let's get that iFrame
  var VUDUIFrame = document.getElementById("contentPlayerFrame");

  // Now let's get the content INSIDE of that.
  var VUDUIFrameContent =
    VUDUIFrame.contentDocument || VUDUIFrame.contentWindow.document;

  // Finally... get the video
  videoPlayer = VUDUIFrameContent.getElementById("videoPlayer");

  videoDuration = videoPlayer.duration; // duration of movie in seconds

  cuTime = videoPlayer.currentTime; // where the user is currently at
}

function calculateEndTime() {
  videoState = "playing"; // Tell PreMID the video is playing correctly (aka don't update the end time again)
  startTime = Date.now(); // Get the point where the user started watching
  endTime = startTime + (videoDuration - cuTime) * 1000; // Get the end of the video (time left)

  if (isNaN(endTime)) {
    // If the video DIDN'T load correctly then endTime will be NaN
    videoState = "loading"; // Video is still loading, calculate again
    calculateEndTime();
  }
}

function pausePresence() {
  videoState = "paused"; // Tell PreMID the user paused, this lets us calculate endTime again when the user starts playing
}

setInterval(grabMetadata, 10000); // Metadata shouldn't ever really change... so this is fine
setInterval(getVideoPlayer, 1000); // If I was dumb enough to run this every frame I would, but I'm considerate and so it shall only run every second

presence.on("UpdateData", () => {
  // Video doesn't exist, and there's no metadata either.
  // Aka, user isn't watching anything.
  if (videoPlayer != null && metadata != undefined) {
    // When the video pauses
    if (videoPlayer.paused) {
      // Only run this once
      if (videoState != "paused") {
        pausePresence();
      }

      // Discord says "hey nice pause"
      presenceData = {
        largeImageKey:
          "vudularge" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
        details: "Watching " + metadata, //The upper section of the presence text
        state: "Paused"
      };
    } else {
      // Only run this once
      if (videoState != "playing") {
        calculateEndTime();
      }

      // Set presence to movie data
      presenceData = {
        largeImageKey:
          "vudularge" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
        smallImageKey:
          "vudusmall" /*The key (file name) of the Large Image on the presence. These are uploaded and named in the Rich Presence section of your application, called Art Assets*/,
        smallImageText: "Watching movies", //The text which is displayed when hovering over the small image
        details: "Watching " + metadata, //The upper section of the presence text
        startTimestamp: startTime, //The unix epoch timestamp for when to start counting from
        endTimestamp: endTime //If you want to show Time Left instead of Elapsed, this is the unix epoch timestamp at which the timer ends
      };
    }

    // Send that activity to discord
    presence.setActivity(presenceData);
  } else {
    // Clear activity
    presence.setTrayTitle();
    presence.setActivity();
  }
});
