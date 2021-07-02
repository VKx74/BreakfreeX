import { EMarketSpecific } from "@app/models/common/marketSpecific";
import { BondsList, CommoditiesList, ForexExoticList, ForexMajorList, ForexMinorList, IndicesList, MetalsList } from "./forex.types";

export class ForexTypeHelper {
    public static GetTypeSpecific(symbol: string): EMarketSpecific {
        const normalizedSymbol = this.NormalizeInstrument(symbol);

        for (const i of ForexMajorList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.ForexMajor;
            }
        } 
        
        for (const i of ForexMinorList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.ForexMinor;
            }
        }
        
        for (const i of ForexExoticList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.ForexExotic;
            }
        }

        for (const i of IndicesList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.Indices;
            }
        }
        
        for (const i of MetalsList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.Metals;
            }
        }

        for (const i of BondsList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.Bonds;
            }
        }

        for (const i of CommoditiesList) {
            const iNormalized = this.NormalizeInstrument(i);
            if (iNormalized === normalizedSymbol) {
                return EMarketSpecific.Commodities;
            }
        }

        return null;
    }

    public static NormalizeInstrument(symbol: string): string {
        return symbol.replace("_", "").replace("/", "").replace("^", "").replace("-", "").toLowerCase();
    }
}