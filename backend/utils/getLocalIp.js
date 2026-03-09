const { networkInterfaces } = require("os");

function getLocalIp() {
  const nets = networkInterfaces();
  let localIp = "localhost";

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        localIp = net.address;
        break;
      }
    }
  }

  return localIp;
}

module.exports = getLocalIp;
