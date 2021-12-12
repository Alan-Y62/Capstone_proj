const publicVapidKey =
  "BMNM21ozV6RccT5cWPAdQDbUFUFueuHQobLVt4doDFKOjCISs3wwjxqmfZ0PSvSQ7Qt-k0V7eIrzCVYYrN6126g";

if ("serviceWorker" in navigator) {
  send().catch((err) => console.error(err));
}

// Register service worker, register push, send push
async function send() {
  // register service worker
  const register = await navigator.serviceWorker.register("/worker.js", {
    scope: "/",
  });

  // register push
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey:
      "BMNM21ozV6RccT5cWPAdQDbUFUFueuHQobLVt4doDFKOjCISs3wwjxqmfZ0PSvSQ7Qt-k0V7eIrzCVYYrN6126g",
  });

  // send push
  await fetch("./subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  });
}
