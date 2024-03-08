import CountriesEnum from "../enum/CountriesEnum.js"
import IndustriesEnum from "../enum/IndustriesEnum.js"

export function isEmailValid(email?: string): boolean {
    // @ts-ignore
    return email
    .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) != null;
}

export function isCompanyNameValid(name?: string): boolean {
    return name?.match(/^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 ''~?!]{2,}$/) !=null;
}

export function isCountryValid(country?: string): boolean {
    return isEnumValid((country) as CountriesEnum, CountriesEnum)
}

export function isIndustryValid(industry?: string): boolean {
    return isEnumValid((industry) as IndustriesEnum, IndustriesEnum)
}

export function isEnumValid(value: any, enumObj: object): boolean {
    if (!value) return false;
    return Object.values(enumObj).includes(value);
}
