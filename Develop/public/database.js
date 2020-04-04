const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB

const database;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({target}) => {
    const db = target.result;
    db.createObjectStore("pending", {autoincrement: true});
};

request.onsuccess = ({target}) => {
    db = target.result;
    if (navigator.onLine) {
        checkDB();
    }
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