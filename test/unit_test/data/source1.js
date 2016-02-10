function print (messages) {
    (messages || []).forEach(function (message) {
        console.log(message);
    });
}

module.exports = print;
