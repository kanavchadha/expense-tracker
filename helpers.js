import { ToastAndroid } from 'react-native';
import { init, generateOverallExpenseSummary, getExpenseSummary, getSearchResSummary, getUnpaidExpenses, getInvestmentsSummary, generateOverallInvestmentSummary } from './DB';
import { MONTHS, SEARCH_SORT_OPTIONS, categoryOptions, investmentCategoryOptions } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INVESTMENT_SORT_OPTIONS } from './constants/data';

export async function processCategoryDataToDisplay(paid, month, all = false) {
    let res;
    if (!all) {
        res = await getExpenseSummary(paid, month);
    } else {
        res = await generateOverallExpenseSummary(paid);
    }
    return transformExpenseSummaryData(res);
}

export async function processSearchResToDisplay(status, fromDate, toDate, value) {
    let res = await getSearchResSummary(status, fromDate, toDate, value);
    return transformExpenseSummaryData(res);
}

const transformExpenseSummaryData = (res) => {
    res = res.reduce((obj, catSum) => {
        const { category, count, total, status } = catSum;
        obj[category] = { ...obj[category], total: total + (obj[category] ? obj[category].total : 0), count: count + (obj[category] ? obj[category].count : 0) };
        if (status === 'true') {
            obj[category].paidAmount = total;
            obj[category].paidCount = count;
        } else {
            obj[category].unpaidAmount = total;
            obj[category].unpaidCount = count;
        }
        return obj;
    }, {});

    const income = res['Monthly Income'] ? res['Monthly Income'] : { total: 0, count: 0 };
    delete res['Monthly Income'];

    let totalExpense = 0, expenseCount = 0, paidExpenseTotal = 0, unpaidExpenseTotal = 0, paidExpenseCount = 0, unpaidExpenseCount = 0;
    const expenseSummary = Object.keys(res).map(cat => {
        totalExpense += res[cat].total;
        expenseCount += res[cat].count;
        paidExpenseTotal += res[cat].paidAmount ? res[cat].paidAmount : 0;
        paidExpenseCount += res[cat].paidCount ? res[cat].paidCount : 0;
        unpaidExpenseTotal += res[cat].unpaidAmount ? res[cat].unpaidAmount : 0;
        unpaidExpenseCount += res[cat].unpaidCount ? res[cat].unpaidCount : 0;
        return { category: cat, ...res[cat] }
    });

    const finalChartData = expenseSummary.map(s => {
        const cat = categoryOptions.find(co => co.value === s.category);
        const percentage = (s.total / totalExpense * 100).toFixed(0);
        return {
            name: s.category,
            label: `${percentage}%`,
            y: Number(s.total),
            expenseCount: s.count,
            color: cat.color,
            id: cat.id,
            icon: cat.icon,
            paidAmount: s.paidAmount,
            unpaidAmount: s.unpaidAmount,
            paidCount: s.paidCount,
            unpaidCount: s.unpaidCount
        };
    });

    return { finalChartData: finalChartData ? finalChartData : [], totalExpense, expenseCount, income, expSumDetail: { paidExpenseCount, paidExpenseTotal, unpaidExpenseCount, unpaidExpenseTotal } };
}

export async function processInvestmentDataToDisplay(filter, fromDate, toDate, all = false) {
    let res;
    if (!all) {
        res = await getInvestmentsSummary(fromDate, toDate, filter);
    } else {
        res = await generateOverallInvestmentSummary(filter);
    }
    return transformInvestmentSummaryData(res);
}

const transformInvestmentSummaryData = (res) => {
    res = res.reduce((obj, catSum) => {
        const { category, count, invCount, retCount, totalInvested, totalReturns, isActive } = catSum;
        obj[category] = {
            ...obj[category],
            totalInvested: totalInvested + (obj[category] ? obj[category].totalInvested : 0),
            totalReturns: totalReturns + (obj[category] ? obj[category].totalReturns : 0),
            count: count + (obj[category] ? obj[category].count : 0),
            totalInvCount: invCount + (obj[category] ? obj[category].invCount : 0),
            totalRetCount: retCount + (obj[category] ? obj[category].retCount : 0)
        };
        if (isActive === 'true') {
            obj[category].activeInvAmount = totalInvested;
            obj[category].activeInvCount = invCount;
            obj[category].activeRetAmount = totalReturns;
            obj[category].activeRetCount = retCount;
        } else {
            obj[category].inActiveInvAmount = totalInvested;
            obj[category].inActiveInvCount = invCount;
            obj[category].inActiveRetAmount = totalReturns;
            obj[category].inActiveRetCount = retCount;
        }
        return obj;
    }, {});

    let totalInvested = 0, totalReturns = 0, allInvestmentsCount = 0, allReturnsCount = 0, investmentRecordsCount = 0,
        activeInvestmentsTotal = 0, inactiveInvestmentsTotal = 0, activeInvestmentsCount = 0, inactiveInvestmentsCount = 0,
        activeReturnsTotal = 0, inactiveReturnsTotal = 0, activeReturnsCount = 0, inactiveReturnsCount = 0;

    const investmentSummary = Object.keys(res).map(cat => {
        totalInvested += res[cat].totalInvested;
        totalReturns += res[cat].totalReturns;
        allInvestmentsCount += res[cat].totalInvCount;
        allReturnsCount += res[cat].totalRetCount;
        investmentRecordsCount += res[cat].count;
        activeInvestmentsTotal += res[cat].activeInvAmount ? res[cat].activeInvAmount : 0;
        activeInvestmentsCount += res[cat].activeInvCount ? res[cat].activeInvCount : 0;
        inactiveInvestmentsTotal += res[cat].inActiveInvAmount ? res[cat].inActiveInvAmount : 0;
        inactiveInvestmentsCount += res[cat].inActiveInvCount ? res[cat].inActiveInvCount : 0;
        activeReturnsTotal += res[cat].activeRetAmount ? res[cat].activeRetAmount : 0;
        activeReturnsCount += res[cat].activeRetCount ? res[cat].activeRetCount : 0;
        inactiveReturnsTotal += res[cat].inActiveRetAmount ? res[cat].inActiveRetAmount : 0;
        inactiveReturnsCount += res[cat].inActiveRetCount ? res[cat].inActiveRetCount : 0;
        return { category: cat, ...res[cat] }
    });

    const chartGroupData = { data1: [], data2: [] };
    const finalChartSummary = investmentSummary.map(catSum => {
        const catData = investmentCategoryOptions.find(co => co.value === catSum.category);
        const invPercentage = totalInvested ? (catSum.totalInvested / totalInvested * 100).toFixed(0) : 0;
        const retPercentage = totalReturns ? (catSum.totalReturns / totalReturns * 100).toFixed(0) : 0;
        chartGroupData.data1.push({ x: catSum.category, y: Number(catSum.totalInvested), label: `${invPercentage}%` });
        chartGroupData.data2.push({ x: catSum.category, y: Number(catSum.totalReturns), label: `${retPercentage}%` });
        return {
            name: catSum.category,
            invTotal: Number(catSum.totalInvested),
            retTotal: Number(catSum.totalReturns),
            invCount: catSum.totalInvCount,
            retCount: catSum.totalRetCount,
            invPercent: `${invPercentage}%`,
            retPercent: `${retPercentage}%`,
            recordsCount: catSum.count,
            color: catData.color,
            id: catData.id,
            icon: catData.icon,
            activeInvAmount: catSum.activeInvAmount,
            activeInvCount: catSum.activeInvCount,
            activeRetAmount: catSum.activeRetAmount,
            activeRetCount: catSum.activeRetCount,
            inActiveInvAmount: catSum.inActiveInvAmount,
            inActiveInvCount: catSum.inActiveInvCount,
            inActiveRetAmount: catSum.inActiveRetAmount,
            inActiveRetCount: catSum.inActiveRetCount
        };
    });

    return {
        chartGroupData,
        investmentRecordsCount,
        finalChartSummary: finalChartSummary ? finalChartSummary : [],
        investmentSumDetail: {
            totalInvested, allInvestmentsCount,
            activeInvestmentsTotal, inactiveInvestmentsTotal, activeInvestmentsCount, inactiveInvestmentsCount
        },
        returnSumDetail: {
            totalReturns, allReturnsCount,
            activeReturnsTotal, inactiveReturnsTotal, activeReturnsCount, inactiveReturnsCount
        }
    };
}

export const getUnpaidNotificationData = async () => {
    try {
        const res = await getUnpaidExpenses();
        const body = res.rows._array.reduce((content, exp, i) =>
            content += `${i + 1}) ${exp.title}: ${exp.amount} Rs ~ ${new Date(exp.date.split(' ')[0]).toDateString()}\n`
            , '')
        const { trigger, userName } = await getNotificationInfo();
        return {
            notificationContent: {
                title: `Hii ${userName}, Check Your Pending Expenses`,
                body: body ? body : 'No Unpaid Expenses :) Good Day!'
            },
            trigger
        }
    } catch (err) {
        console.log('Unable to generate notification content: ', err.message);
        throw err;
    }
}

async function getNotificationInfo() {
    try {
        const userData = await getUserData();
        const notification = userData?.notification, userName = userData?.name;
        const trigger = new Date();
        if (notification === 'EveryDay') {
            if (trigger.getHours() > 10) trigger.setDate(trigger.getDate() + 1);
        } else if (notification === 'monthEnd') {
            trigger.setMonth(trigger.getMonth() + 1);
            trigger.setDate(0);
        } else {
            return { userName };
        }
        trigger.setHours(10, 0, 0);
        return { trigger, userName };
    } catch (err) {
        console.log('Error in notificaion data reading: ', err.message);
        throw err;
    }
}

export const getUserData = async () => {
    const jsonValue = await AsyncStorage.getItem('userInfo')
    return jsonValue != null ? JSON.parse(jsonValue) : null;
}

export const showToastMessage = (msg, position, duration = 'long') => {
    if (!msg) return;

    if (position === 'top') position = ToastAndroid.TOP;
    else if (position === 'center') position = ToastAndroid.CENTER;
    else position = ToastAndroid.BOTTOM;

    if (duration === 'long') duration = ToastAndroid.LONG;
    else duration = ToastAndroid.SHORT;

    ToastAndroid.show(msg, duration, position);
}

export const generateExpenseHtmlTemplate = (heading, body, status, month) => {
    month = (MONTHS.find(m => m.id === month))?.value;
    let extraInfo = `<div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
        <span style="color: #FF615F; font-size: 20px;"><b>Month:</b> ${month} </span>
        <span style="color: #FF615F; font-size: 20px;"><b>Status:</b> ${status === 'true' ? 'PAID' : status === 'false' ? 'UNPAID' : 'ALL'} </span>
    </div>`;
    if (!status && !month) extraInfo = '';

    const html = `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
                @page {
                    margin: 25px;
                }
            </style>
        </head>
        <body>
            <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: bold; text-align: center; margin-bottom: 50px">
                ${heading}
            </h1>
            ${extraInfo}
            ${body}
        </body>
    </html>`;
    return html;
}

export const generateHtmlForExpenseCategory = (expenseList, catSummary, category) => {
    const expList = expenseList.reduce((expLi, exp) => expLi + ` <li>
                <h3 style="font-weight: bold;">${exp.title}</h3>
                <p style="color: #898C95;"> ${exp.description} </p>
                <b style="color: #008159;">Amount: ${exp.amount} Rs</b>
                <i style="color: #FF615F; display: block;">Status: ${exp.status === 'true' ? 'paid' : 'unpaid'}</i>
                <div style="color: #8e44ad; font-weight: 600;">Date: ${new Date(exp.date.split(' ')[0]).toDateString()}</div>
            </li> `,
        '');

    const body = `
        <div style="margin-top: 50px;">
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;">
                    <div style="color: #194868; font-size: 26px; font-weight: bold; text-overflow: ellipsis;">${category}</div>
                    <b style="color: #446380; margin-left: 2px; margin-top: 6px; font-size: 18px;">${catSummary.totalAmount} Rs Total</b>
                </div>
                <b style="color: #446380; margin-right: 10px; font-size: 18px;">${catSummary.count} Total</b>
            </div>
            <ol>
                ${expList}
            </ol>
        </div>
    `;
    return body;
}

export const generateHtmlForAllExpenses = (allExpenses, expenseSummary, status, month) => {
    let getExpenseSummary = {}, totalExpense = { amount: 0, count: 0 }, totalIncome = { amount: 0, count: 0 };
    expenseSummary.forEach((summ) => {
        if (summ.category === 'Monthly Income') {
            totalIncome.amount += summ.totalAmount;
            totalIncome.count += summ.count;
        } else {
            totalExpense.amount += summ.totalAmount;
            totalExpense.count += summ.count;
        }
        getExpenseSummary[summ.category] = summ;
    });
    let body = '';
    body += `
        <div style="margin-bottom: 50px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="color: #008159; font-size: 20px;"><b>Total Income: </b> ${totalIncome.amount}Rs (${totalIncome.count}) </div>
            </div>
            <div>
                <div style="color: #e01616; font-size: 20px;"><b>Total Expense: </b> ${totalExpense.amount}Rs (${totalExpense.count}) </div>
            </div>
        </div>
    `
    body += Object.keys(allExpenses).reduce((catDiv, category) => {
        const catSummary = getExpenseSummary[category];
        return catDiv + generateHtmlForExpenseCategory(allExpenses[category].expenseList, catSummary, category);
    }, '');

    return generateExpenseHtmlTemplate('My Expenses', body, status, month);
}

export const generateHtmlForExpenseSearchRes = (expenseList, expensesSummary, dates, searchQuery, status, sort) => {
    const income = `${expensesSummary.income.total}Rs (${expensesSummary.income.count})`;
    const expenditure = `${expensesSummary.totalExpense}Rs (${expensesSummary.expenseCount})`;
    let incomeDetails = '', expenditureDetails = '';
    if (status === 'all') {
        if (expensesSummary.income.paidAmount) {
            incomeDetails += `[ ${expensesSummary.income.paidAmount}Rs (${expensesSummary.income.paidCount}) ] P `;
        }
        if (expensesSummary.income.unpaidAmount) {
            incomeDetails += ` [ ${expensesSummary.income.unpaidAmount}Rs (${expensesSummary.income.unpaidCount}) ] U`;
        }
        if (expensesSummary.expSumDetail.paidExpenseTotal) {
            expenditureDetails += `[ ${expensesSummary.expSumDetail.paidExpenseTotal}Rs (${expensesSummary.expSumDetail.paidExpenseCount}) ] P `;
        }
        if (expensesSummary.expSumDetail.unpaidExpenseTotal) {
            expenditureDetails += ` [ ${expensesSummary.expSumDetail.unpaidExpenseTotal}Rs (${expensesSummary.expSumDetail.unpaidExpenseCount}) ] U`;
        }
    }

    dates.from = dates.from?.toDateString();
    dates.to = dates.to?.toDateString();
    sort = SEARCH_SORT_OPTIONS.find(opt => opt.value === sort)?.label;

    const expList = expenseList.reduce((expLi, exp) => expLi + ` <li>
                <h3 style="font-weight: bold;">${exp.title} <span style="color: #194868;">[ ${exp.category} ]</span> </h3>
                <p style="color: #898C95;"> ${exp.description} </p>
                <b style="color: #008159;">Amount: ${exp.amount} Rs</b>
                <i style="color: #FF615F; display: block;">Status: ${exp.status === 'true' ? 'paid' : 'unpaid'}</i>
                <div style="color: #8e44ad; font-weight: 600;">Date: ${new Date(exp.date.split(' ')[0]).toDateString()}</div>
            </li> 
    `, '');
    const body = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
            <span style="color: #FF615F; font-size: 20px"><b>Status:</b> ${status === 'true' ? 'PAID' : status === 'false' ? 'UNPAID' : 'ALL'} </span>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="padding-bottom: 20px;">
                    <p style="font-weight: bold; margin-bottom: 10px; margin-top: 0;">From:</p>
                    <span style="border: 2px solid #FF615F; padding: 8px 10px; border-radius: 6px; font-size: 20px"">${dates.from}</span>
                </span>
                <b style="padding: 0 10px;">-></b>
                <span style="padding-bottom: 20px;">
                    <p style="font-weight: bold; margin-bottom: 10px; margin-top: 0;">To:</p>
                    <span style="border: 2px solid #FF615F; padding: 8px 10px; border-radius: 6px; font-size: 20px"">${dates.to}</span>
                </span>
            </div>
            <span style="color: #FF615F; font-size: 20px"">${sort} </span>
            <span style="font-size: 20px; color: #194868; text-align: center; padding: 0 15px;">${searchQuery}</span>
        </div>
        <div style="margin-bottom: 50px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <div style="color: #008159; margin: 0 10px; font-size: 20px;"><b>Total Income: </b> ${income} </div>
                <span style="color: #008159; margin: 5px 10px; font-size: 20px;">${incomeDetails}</span>
            </div>
            <div>
                <div style="color: #e01616; margin: 0 10px; font-size: 20px;"><b>Total Expense: </b> ${expenditure} </div>
                <span style="color: #e01616; margin: 5px 10px; font-size: 20px;">${expenditureDetails}</span>
            </div>
        </div>
        <div style="margin-top: 25px;">
            <ol>
                ${expList}
            </ol>
        </div>   
    `;
    return generateExpenseHtmlTemplate('Searched Expenses', body);
}

export const generateInvestmentsHtmlTemplate = (heading, body, dates, filter, sort) => {
    dates.from = dates.from?.toDateString();
    dates.to = dates.to?.toDateString();
    sort = INVESTMENT_SORT_OPTIONS.find(opt => opt.value === sort)?.label;
    // extra stuff: dates, filters.
    const extraInfo = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="padding-bottom: 20px;">
                    <p style="font-weight: bold; margin-bottom: 10px; margin-top: 0;">From:</p>
                    <span style="font-size: 20px; border: 2px solid #FF615F; padding: 8px 10px; border-radius: 6px;">${dates.from}</span>
                </span>
                <b style="padding: 0 10px;">-></b>
                <span style="padding-bottom: 20px;">
                    <p style="font-weight: bold; margin-bottom: 10px; margin-top: 0;">To:</p>
                    <span style="font-size: 20px; border: 2px solid #FF615F; padding: 8px 10px; border-radius: 6px;">${dates.to}</span>
                </span>
            </div>
            <span style="font-size: 20px; color: #FF615F;"><b>Status:</b> ${filter === 'true' ? 'ACTIVE' : filter === 'false' ? 'MATURED' : 'ALL'} </span>
            <span style="font-size: 20px; color: #FF615F;">${sort} </span>
        </div>
    `;

    const html = `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
                @page {
                    margin: 25px;
                }
            </style>
        </head>
        <body>
            <h1 style="font-size: 50px; font-family: Helvetica Neue; font-weight: bold; text-align: center; margin-bottom: 50px">
                ${heading}
            </h1>
            ${extraInfo}
            ${body}
        </body>
    </html>`;
    return html;
}

export const generateHtmlForInvestmentCategory = (investmentList, catSummary, category) => {
    const invList = investmentList.reduce((invLi, inv) => {
        let investments = inv.investments ? JSON.parse(inv.investments) : [], returns = inv.returns ? JSON.parse(inv.returns) : [];

        investments = investments.reduce((invs_, inv_) => invs_ += `
            <div style="border: 1px solid #e01616; border-radius: 5px; margin: 3px; padding: 6px; width: max-content;">
                <span style="font-size: 16px; color: #e01616">
                    Date: <span style="color: #898C95">${new Date(inv_.date)?.toDateString()}</span>
                </span>
                <span style="font-size: 16px; color: #e01616">
                    Amount: <span style="color: #898C95">${inv_.amount} Rs</span>
                </span>
                <span style="font-size: 16px; color: #e01616">
                    Interest: <span style="color: #898C95">${inv_.interest}%</span>
                </span>
            </div> 
        `, '');

        returns = returns.reduce((rets_, ret_) => rets_ += `
            <div style="border: 1px solid #008159; border-radius: 5px; margin: 3px; padding: 6px; width: max-content;">
                <span style="font-size: 16px; color: #008159">
                    Date: <span style="color: #898C95">${new Date(ret_.date)?.toDateString()}</span>
                </span>
                <span style="font-size: 16px; color: #008159">
                    Amount: <span style="color: #898C95">${ret_.amount} Rs</span>
                </span>
            </div> 
        `, '');

        invLi += ` 
            <li>
                <h3 style="font-weight: bold;">${inv.title}</h3>
                <p style="color: #898C95;"> ${inv.reference} </p>
                <div style="color: #8e44ad; font-weight: 600;">StartDate: ${new Date(inv.startDate.split(' ')[0]).toDateString()}</div>
                <div style="margin: 5px 0; display: flex, justify-content: space-between; align-items: center; width: max-content;">
                    <span style="font-size: 16px; color: #194868; flex: 0.5">
                        Time Period: <span style="color: #898C95">${inv.timePeriod}</span>
                    </span>
                    <span style="font-size: 16px; color: #194868; flex: 0.5">
                        Status: <span style="color: #898C95">${inv.isActive === 'true' ? 'Active' : 'Matured'}</span>
                    </span>
                </div>
                <div style="margin: 5px 0; display: flex, justify-content: space-between; align-items: center; width: max-content;">
                    <span style="font-size: 16px; color: #194868; flex: 0.5">
                        Investment: <span style="color: #898C95">${inv.totalInvAmount} Rs</span>
                    </span>
                    <span style="font-size: 16px; color: #194868; flex: 0.5">
                        Returns: <span style="color: #898C95">${inv.totalRetAmount} Rs</span>
                    </span>
                </div>
                <div>
                    <div style="margin: 5px; display: flex, justify-content: space-between; align-items: center; width: max-content;">
                        <span style="font-size: 16px; color: #e01616">Investments:</span>
                        <span style="font-size: 16px; color: #e01616"> ${inv.totalInvCount} </span>
                    </div>
                    ${investments}
                </div>
                <div>
                    <div style="margin: 5px; display: flex, justify-content: space-between; align-items: center; width: max-content;">
                        <span style="font-size: 16px; color: #008159">Returns:</span>
                        <span style="font-size: 16px; color: #008159"> ${inv.totalRetCount} </span>
                    </div>
                    ${returns}
                </div>
            </li> 
        `;
        return invLi;
    }, '');

    const body = `
        <div style="margin-top: 20px;">
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;">
                    <div style="color: #42B0FF; font-size: 26px; font-weight: bold; text-overflow: ellipsis;">${category}</div>
                    <div style="display: flex; align-items: center; margin-top: 5px;">
                        <span style="font-size: 18px; color: #e01616; margin-right: 5px;">(${catSummary.invCount}) ${catSummary.totalInvested}Rs Invested</span>
                        <span style="font-size: 18px; color: #008159;">(${catSummary.retCount}) ${catSummary.totalReturns}Rs Returned</span>
                    </div>
                </div>
                <b style="color: #42B0FF; margin-right: 10px; margin-top: 5px; font-size: 18px;">${catSummary.count} Total</b>
            </div>
            <ol>
                ${invList}
            </ol>
        </div>
    `;
    return body;
}

export const generateHtmlForAllInvestments = (allInvestments, investmentSummary, dates, filter, sort) => {
    let getInvestmentSummary = {}, totalInvestment = { amount: 0, count: 0 }, totalReturns = { amount: 0, count: 0 }, schemes = 0;
    investmentSummary.forEach((summ) => {
        totalInvestment.amount += summ.totalInvested;
        totalInvestment.count += summ.invCount;
        totalReturns.amount += summ.totalReturns;
        totalReturns.count += summ.retCount;
        schemes += summ.count;
        getInvestmentSummary[summ.category] = summ;
    });
    let body = '';
    body += `
        <div style="margin-bottom: 50px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 20px; color: #008159; margin: 0 10px;"><b>Total Investment: </b> ${totalInvestment.amount}Rs (${totalInvestment.count}) </div>
            <div style="font-size: 20px; color: #42B0FF; margin: 0 10px;"><b>Num Of Schemes: </b> ${schemes} </div>
            <div style="font-size: 20px; color: #e01616; margin: 0 10px;"><b>Total Returns: </b> ${totalReturns.amount}Rs (${totalReturns.count}) </div>           
        </div>
    `
    body += Object.keys(allInvestments).reduce((catDiv, category) => {
        const catSummary = getInvestmentSummary[category];
        return catDiv + generateHtmlForInvestmentCategory(allInvestments[category].investmentList, catSummary, category);
    }, '');

    return generateInvestmentsHtmlTemplate('My Investments', body, dates, filter, sort);
}

export const getUniqueId = (length) => {
    const id = Math.random().toString(16).slice(2);
    if (length) {
        length = length > 12 ? 12 : length;
        return id.slice(0, length - 1);
    }
    return id;
    // return crypto.randomUUID();
}

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const initDB = async () => {
    return init();
};