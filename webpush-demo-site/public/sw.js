console.log("Service worker loaded...");

self.addEventListener('push', function(e) {
    const data = e.data.json();
    self.registration.showNotification(
        data.title,
        {
            body: data.body,
        }
    );
})