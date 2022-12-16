var location = "";
function getRequirements(eventID) {
  let jsonLink = `https://25live.collegenet.com/25live/data/${location}/run/event/detail/evdetail.json?event_id=${eventID}&caller=pro-EvdetailDao.get`;
  let json = UrlFetchApp.fetch(jsonLink);
  let returnArray = [];
  json = JSON.parse(String(json));
  let requirements = json["evdetail"]["defn"]["panel"][6]["item"][0];
  const tags = /<\/?\w+ ?\/?>/g;
  let description;
  let comments;
  let confirmationText;
  let noDetails = "No details at this time.";
  let expectedHeadCount = "";
  let registeredHeadCount = "";
  let eventCategory = "";
  try {
    description =
      `${json["evdetail"]["defn"]["panel"][1]["item"][0]["itemName"]}`
        .replace("<br />", "\n")
        .replace(tags, "\n")
        .replaceAll("\n", "\n\t");
    if (description.startsWith("\n")) description = description.substring(2);
  } catch {
    description = noDetails;
  }
  try {
    comments = json["evdetail"]["defn"]["panel"][2]["item"][0]["item"][0][
      "itemName"
    ].replaceAll("\n", "\n\t");
  } catch {
    comments = noDetails;
  }
  try {
    confirmationText = json["evdetail"]["defn"]["panel"][4]["item"][0][
      "itemName"
    ].replaceAll("\n", "\n\t");
  } catch {
    confirmationText = noDetails;
  }
  try {
    eventCategory =
      json["evdetail"]["defn"]["panel"][0]["item"][10]["item"][0]["itemName"];
  } catch {
    eventCategory = undefined;
  }
  try {
    expectedHeadCount =
      json["evdetail"]["defn"]["panel"][0]["item"][11]["item"][0]["item"][0][
        "itemLabel"
      ];
  } catch {
    expectedHeadCount = undefined;
  }
  try {
    registeredHeadCount =
      json["evdetail"]["defn"]["panel"][0]["item"][11]["item"][0]["item"][1][
        "itemLabel"
      ];
  } catch {
    registeredHeadCount = undefined;
  }
  for (let requirement in requirements) {
    for (let item in requirements[requirement]) {
      returnArray.push(
        `${requirements[requirement][item]["itemLabel"]} : ${
          requirements[requirement][item]["itemName"]
            ? requirements[requirement][item]["itemName"]
            : noDetails
        }`
      );
    }
  }
  //Adds no details if none
  let descNoDetails = ``;
  description = `\n\nDescription:\n\t${description ? description : noDetails}`;
  comments = `\n\nComments:\n\t${comments ? comments : noDetails}`;
  confirmationText = `\n\nConfirmation Text:\n\t${
    confirmationText ? confirmationText : noDetails
  }`;
  let headCount = `\n\nHead Count\n\t${
    expectedHeadCount ? expectedHeadCount : 0
  } expected\n\t${registeredHeadCount ? registeredHeadCount : 0} expected`;
  eventCategory = `\n\nEvent Category:\n\t${
    eventCategory ? eventCategory : "No category at this time."
  }`;
  return `Requirements:\n\t${returnArray.join(
    "\n\t"
  )}${description}${comments}${confirmationText}${headCount}${eventCategory}`;
}
