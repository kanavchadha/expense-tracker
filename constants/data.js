import { COLORS } from './theme';
import icons from "./icons";

export const categoryOptions = [
    { id: '1', icon: icons.category, color: COLORS.black, value: 'Category' },
    { id: '4', icon: icons.education, color: COLORS.yellow, value: 'Education' },
    { id: '5', icon: icons.food, color: COLORS.darkYellow, value: 'Food/Eatables' },
    { id: '8', icon: icons.bill, color: COLORS.darkBlue, value: 'Bills' },
    { id: '3', icon: icons.rent, color: COLORS.seaGreen, value: 'Rent' },
    { id: '7', icon: icons.homeNeeds, color: COLORS.orange, value: 'Home Needs' },
    { id: '9', icon: icons.vehicle, color: COLORS.blue, value: 'Vehicles' },
    { id: '6', icon: icons.child, color: COLORS.peach, value: 'Child' },
    { id: '13', icon: icons.healthcare, color: COLORS.red, value: 'Medical' },
    { id: '10', icon: icons.beautyCare, color: COLORS.pink, value: 'Beauty and Care' },
    { id: '11', icon: icons.cloth, color: COLORS.darkgreen, value: 'Clothing' },
    { id: '12', icon: icons.enjoyment, color: COLORS.purple, value: 'Enjoyment' },
    { id: '14', icon: icons.personalNeeds, color: COLORS.babyPurple, value: 'Personal Need' },
    { id: '15', icon: icons.other, color: COLORS.olive, value: 'Other' },
    { id: '2', icon: icons.income, color: COLORS.primary, value: 'Monthly Income' },
];

export const MONTHS = [
    {id: 0, value: 'January'},
    {id: 1, value: 'February'},
    {id: 2, value: 'March'},
    {id: 3, value: 'April'},
    {id: 4, value: 'May'},
    {id: 5, value: 'June'},
    {id: 6, value: 'July'},
    {id: 7, value: 'August'},
    {id: 8, value: 'September'},
    {id: 9, value: 'October'},
    {id: 10, value: 'November'},
    {id: 11, value: 'December'},
];

export const SEARCH_FILTERS = [
    {id: '0', label: 'Newest First', value: 'id DESC'},
    {id: '1', label: 'Oldest First', value: 'id ASC'},
    {id: '2', label: 'Amount-Low->High', value: 'amount ASC'},
    {id: '3', label: 'Amount-High->Low', value: 'amount DESC'},
    {id: '4', label: 'Date ASC', value: 'date ASC'},
    {id: '5', label: 'Date DESC', value: 'date DESC'}
];

export const INVESTMENT_FILTERS = [
    {id: '1', label: 'Matured Only', value: 'matured'},
    {id: '2', label: 'Active Only', value: 'active'},
    {id: '3', label: 'All', value: 'all'},
]

export const INVESTMENT_SORT_OPTIONS = [
    {id: '0', label: 'Newest First', value: 'id DESC'},
    {id: '1', label: 'Oldest First', value: 'id ASC'},
    {id: '2', label: 'Amount-Low->High', value: 'amount ASC'},
    {id: '3', label: 'Amount-High->Low', value: 'amount DESC'},
    {id: '4', label: 'Date ASC', value: 'date ASC'},
    {id: '5', label: 'Date DESC', value: 'date DESC'},
];

export const investmentCategoryOptions = [
    { id: '1', icon: icons.investmentCategory, color: COLORS.black, value: 'Category' },
    { id: '2', icon: icons.fd, color: COLORS.primary, value: 'Fixed Deposit' },
    { id: '3', icon: icons.ppf, color: COLORS.darkYellow, value: 'PPF' },
    { id: '4', icon: icons.stocks, color: COLORS.darkBlue, value: 'Stocks' },
    { id: '5', icon: icons.kvp, color: COLORS.darkgreen, value: 'KVP' },
    { id: '6', icon: icons.mfunds, color: COLORS.red, value: 'Mutual Funds' },
    { id: '7', icon: icons.nsc, color: COLORS.olive, value: 'NSC' },
    { id: '8', icon: icons.scss, color: COLORS.blue, value: 'SCSS' },
    { id: '9', icon: icons.mic, color: COLORS.peach, value: 'Monthly Income Scheme' },
    { id: '10', icon: icons.lifeinsurance, color: COLORS.danger, value: 'Life Insurance' },
    { id: '11', icon: icons.otherInvestments, color: COLORS.purple, value: 'Other' },
];