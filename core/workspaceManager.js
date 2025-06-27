let hiddenApps = []; 

const { getOpenApps, hideApps } = require("../utils/applescript");

function clearWorkspace() {
  return new Promise((resolve, reject) => {
    getOpenApps((apps) => {
      if (!apps) return reject("Failed to get apps");
      console.log("Hiding apps:", apps);

      hiddenApps = apps; 
      hideApps(apps);
      resolve(apps);
    });
  });
}

function getPreviouslyHiddenApps() {
  return hiddenApps;
}

module.exports = {
  clearWorkspace,
  getPreviouslyHiddenApps,
};
