setInterval(() => {
    updateEndDate();
}, 1000);

function updateEndDate() {
    // GTM time
    var endTimestamp = Date.parse("Mon, 30 Nov 2020 00:00:00 GMT");

    // already local time
    var endDate = new Date(endTimestamp);
    var dateNow = new Date();
    var diffTime = Math.abs(endDate - dateNow);
    var secondShift = 1000;
    var minuteShift = secondShift * 60;
    var hourlyShift = minuteShift * 60;
    var dayShift = hourlyShift * 24;

    var days = Math.floor(diffTime / dayShift);
    diffTime = diffTime - (days * dayShift);
    var hours = Math.floor(diffTime / hourlyShift);
    diffTime = diffTime - (hours * hourlyShift);
    var minutes = Math.floor(diffTime / minuteShift);
    diffTime = diffTime - (minutes * minuteShift);
    var seconds = Math.floor(diffTime / secondShift);
    var text = days + " days       " + hours + " hours      " + minutes + " minutes     " + seconds + " seconds";
    // console.log(text);

    $(".remaining-timer")[0].innerHTML = text;
}