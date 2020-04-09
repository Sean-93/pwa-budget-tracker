

const filesToCache = ["/", "index.js", "styles.css", "database.js", "manifest.webmanifest"];
console.log("Hi from your service-worker.js file!");

const cacheName = "my-site-cache-v1";
const cachedData = "data-cache-v1";

self.addEventListener("install", function(evt) {
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log("Files were pre-cached!");
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  if (event.request.url.includes("/api")) {
    event.respondWith(caches.open(cachedData).then(data => {
      return fetch(event.request).then(response => {
        if (response.status === 200) {
          data.put(event.request.url, response.clone())
        }
        return response;
      }).catch(err => {
        return cache.match(event.request)
      })
    }))
    return;
  }
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
