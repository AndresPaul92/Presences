let presence = new Presence({
  clientId: "701863684728946799"
});

let elapsed = Math.floor(Date.now() / 1000);

presence.on("UpdateData", async () => {
  let presenceData = {
    largeImageKey: "irentae",
    startTimestamp: elapsed,
    details: location.href.split(location.host)[1]
  };

  if (
    location.pathname === "/" ||
    location.href.split(location.host)[1].toLowerCase() === "/index"
  ) {
    presenceData.details = "/index";
  }

  presence.setTrayTitle("Terminal 00 - " + presenceData.details);
  presence.setActivity(presenceData);
});
