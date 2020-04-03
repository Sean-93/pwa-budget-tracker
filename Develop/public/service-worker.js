const filesToCache = ["/", "app.js", "styles.css"];
console.log("Hi from your service-worker.js file!");

const cacheName = "data-cache-v1";

self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("Files were pre-cached!");
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        }
        else if (event.request.headers.get("accept").includes("text/html")) {
          return caches.match("/index.html")
        }
      });
    })
  );
});
