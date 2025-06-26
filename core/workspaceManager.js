const { getOpenApps, hideApps } = require("../utils/applescript");

function clearWorkspace() {
    return new Promise((resolve, reject) => {
      getOpenApps((apps) => {
        if (!apps) return reject("Failed to get apps");
        console.log("Hiding apps:", apps);
        hideApps(apps);
        resolve(apps); // ✅ return the list of hidden apps
      });
    });
  }

module.exports = {
  clearWorkspace
};
