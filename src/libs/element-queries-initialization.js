(() => {
    let ignoredStylesheets = [
        'StockChartX.min.css',
        'StockChartX.UI.min.css',
        'StockChartX.External.min.css'
    ];

    document.addEventListener('DOMNodeInserted', (e) => {
        if (e.target.tagName) {
            let tagName = e.target.tagName.toLowerCase(),
                disableDetectionAttr = e.target.getAttribute('data-disable-detection');

            if ((tagName === 'link' || tagName === 'style') && !disableDetectionAttr) {
                let href = e.target.getAttribute('href'),
                    fileName = href ? getFileName(href) : null;

                if (ignoredStylesheets.indexOf(fileName) === -1) {
                    let styleSheet = document.styleSheets[document.styleSheets.length - 1];

                    if (ElementQueries.instance) {
                        ElementQueries.instance.readRules(styleSheet.cssRules);
                    }
                }
            }
        }
    });

    function getFileName(url) {
        let index = url.lastIndexOf('/');

        if (index !== -1) {
            return url.slice(index + 1, url.length);
        }

        return url;
    }
})();