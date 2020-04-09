const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB

let database = null;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({target}) => {
    database = target.result;
    database.createObjectStore("pending", {autoIncrement: true});
};

request.onsuccess = ({target}) => {
    database = target.result;
    if (navigator.onLine) {
        checkDB();
    }
}

request.onerror = function(event) {
console.log(event.target.errorCode)
}

function saveRecord(info) {
const transaction = database.transaction(["pending"], "readwrite");
const storeInfo = transaction.objectStore("pending");
storeInfo.add(info);
}

function checkDB() {
    const transaction = database.transaction(["pending"], "readwrite");
    const info = transaction.objectStore("pending");
    const getAll = info.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {method: "POST", body: JSON.stringify(getAll.result), headers: {Accept: "application/JSON, text/plain", "content-type": "application/JSON"}}).then(data => {
                return data.json();
            }).then(() => {
                const transaction = database.transaction(["pending"], "readwrite");
                const storeInfo = transaction.objectStore("pending");
                storeInfo.clear();
            })
        }
    }
}

window.addEventListener("online", checkDB);