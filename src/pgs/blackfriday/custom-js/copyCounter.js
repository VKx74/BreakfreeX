window.onload = function() {
    $.get("https://system-platform-stage.breakfreetrading.com/v1/sysnotification/api/PromoText", function(data, status) {
        $(".copy-counter")[0].innerHTML = data + " out of 350 copies remaining.";
    });
};