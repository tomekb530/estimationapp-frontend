import type { Estimation } from "@/types/Estimation";
import { EstimationDuration } from "@/types/EstimationDuration";

export const parseDate = (date: string) => {
    return new Date(date).toLocaleString();
}

export const parseCountry = (code: string) => {
    return new Intl.DisplayNames(['pl'], { type: 'region' }).of(code);
}

export const calcFullPrice = (estimation: Estimation) => {
    if(estimation.type === EstimationDuration.Fixed) {
        return estimation.price;
    } else {
        return estimation.price * estimation.duration;
    }
    return 0;
}