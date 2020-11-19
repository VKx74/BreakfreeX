window.onload = function() {
    $(".checkout").on("click", () => {
        toCheckout();
    });
};

function toCheckout() {
    window.stripe.redirectToCheckout({
        lineItems: [{price: "price_1HpDGDBI1GhkUGQtrut15Ibq", quantity: 1}],
        mode: 'subscription',
        successUrl: window.location.origin + "/#/pages/success-checkout",
        cancelUrl: window.location.origin
      });
}