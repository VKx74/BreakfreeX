export function getPageQueryParamValue(pageQueryParam: string): number {
    if (pageQueryParam == null) {
        return 1;
    }

    if (isNaN(parseInt(pageQueryParam.toString(), 10))) {
        return 1;
    }

    return parseInt(pageQueryParam.toString(), 10);
}
