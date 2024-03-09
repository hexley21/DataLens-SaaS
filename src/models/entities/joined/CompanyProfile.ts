import TiersEnum from "../enum/TiersEnum.js"


type CompanyProfile = {
    email: string,
    company_name: string,
    industry: string,
    country: string,
    subscription_tier: TiersEnum
    tier_start: Date,
    tier_end: Date,
    files_uploaded: number,
    user_count: number,
    price: number
    registration_date: Date
}

export default CompanyProfile;