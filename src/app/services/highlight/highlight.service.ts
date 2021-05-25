import { Injectable } from "@angular/core";

@Injectable()
export class HighlightService {
    private highlightFunction: (elementSelector: string, content: string) => void = (selector, text) => {
        let element = $(selector)[0];
        let backdrop = $(".highlight-backdrop")[0];
        let textElement = $(".highlight-text")[0];
        let textContentElement = $(".highlight-text-content")[0];
        let rect = element.getBoundingClientRect();

        backdrop.style.left = rect.left + 'px';
        backdrop.style.top = rect.top + 'px';
        backdrop.style.width = rect.width + 'px';
        backdrop.style.height = rect.height + 'px';
        backdrop.style.display = "block";

        textElement.style.left = rect.left + 10 + 'px';
        textElement.style.top = rect.top + 10 + 'px';
        textElement.style.display = "block";
        textContentElement.innerHTML = text;
    }
    
    private highlightOrderNetPNLFunction: () => void = () => {
        let order_cells = $(".net-pl-cell");
        order_cells.addClass("highlight");
    }

    private removeHighlightFunction: () => void = () => {
        let backdrop = $(".highlight-backdrop")[0];
        backdrop.style.display = "none";
        let backdropText = $(".highlight-text")[0];
        backdropText.style.display = "none";
    }
    
    private removeHighlightOrderNetPNLFunction: () => void = () => {
        let order_cells = $(".net-pl-cell");
        order_cells.removeClass("highlight");
    }

    public highlightBacktestChart(clearTimer?: number) {
        console.log("highlightBacktestChart");
        this.removeHighlight();
        this.highlightFunction(".tcd-component", `
        Welcome to a live backtest of BFT Algorithm on EURUSD from early 2020 to late 2021.
        `);

        if (clearTimer) {
            setTimeout(() => {
                this.removeHighlight();
            }, clearTimer);
        }
    }

    public highlightBottomPanel(clearTimer?: number) {
        this.removeHighlight();
        this.highlightFunction("trade-manager", `
            As the backtest begins running, you will see how we traded EURUSD from 2020 to 2021, 
            and orders will show up here, and with direct lines on the chart.
        `);

        if (clearTimer) {
            setTimeout(() => {
                this.removeHighlight();
            }, clearTimer);
        }
    }

    public highlightBottomOrdersPNL(clearTimer?: number) {
        this.removeHighlight();
        this.highlightFunction("trade-manager", `
            Realized profits from a single market with algorithm assisted trading. 
        `);

        this.highlightOrderNetPNLFunction();

        if (clearTimer) {
            setTimeout(() => {
                this.removeHighlight();
            }, clearTimer);
        }
    }

    public removeHighlight() {
        this.removeHighlightFunction();
        this.removeHighlightOrderNetPNLFunction();
    }
}