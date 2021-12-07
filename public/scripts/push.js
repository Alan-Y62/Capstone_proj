let push = require("web-push");

let VAPIDKeys = {
  publicKey:
    "BMNM21ozV6RccT5cWPAdQDbUFUFueuHQobLVt4doDFKOjCISs3wwjxqmfZ0PSvSQ7Qt-k0V7eIrzCVYYrN6126g",
  privateKey: "FFWSWP8fNqiks53-pt8m0u-CN7vi2TB9b3mjhpuuAfA",
};

push.setVapidDetails(
  "andyjiang0818@gmail.com",
  VAPIDKeys.publicKey,
  VAPIDKeys.privateKey
);

let sub = {};
push.sendNotification(sub, "test");
