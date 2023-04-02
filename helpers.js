import { ToastAndroid } from 'react-native';
import { init, generateOverallExpenseSummary, getExpenseSummary, getSearchResSummary, getUnpaidExpenses } from './DB';
import { categoryOptions } from './constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { shareAsync } from 'expo-sharing';
// import * as Print from 'expo-print';

export async function processCategoryDataToDisplay(paid, month, all = false) {
    let res;
    if (!all) {
        res = await getExpenseSummary(paid, month);
    } else {
        res = await generateOverallExpenseSummary(paid);
    }
    return transformSummaryData(res);
}

export async function processSearchResToDisplay(status, fromDate, toDate, value) {
    let res = await getSearchResSummary(status, fromDate, toDate, value);
    return transformSummaryData(res);

}

function transformSummaryData(res) {
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

export const getUnpaidNotificationData = async () => {
    try {
        const res = await getUnpaidExpenses();
        const body = res.rows._array.reduce((content, exp, i) => 
            content += `${i + 1}) name: ${exp.title}, amount: ${exp.amount}, date: ${new Date(exp.date.split(' ')[0]).toDateString()}\n`
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
        const notification = userData?.notification, userName = userData && userData.userName ? userData.userName: 'anonymous';
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

export const showToastMessage = (msg, position, duration) => {
    if (!msg) return;

    if (position === 'top') position = ToastAndroid.TOP;
    else if (position === 'center') position = ToastAndroid.CENTER;
    else position = ToastAndroid.BOTTOM;

    if (duration === 'long') duration = ToastAndroid.LONG;
    else duration = ToastAndroid.SHORT;

    ToastAndroid.show(msg, duration, position);
}

export const generateHtmlTemplate = (heading, body, status, month) => {
    let extraInfo = `<div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
        <span style="color: rgb(244, 50, 50);"><b>Month:</b> ${month} </span>
        <span style="color: rgb(244, 50, 50);"><b>Status:</b> ${status === 'true' ? 'PAID' : status === 'false' ? 'UNPAID' : 'ALL'} </span>
    </div>`;
    if (!status && !month) extraInfo = '';

    const html = `
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
                @page {
                    margin: 20px;
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
                <p style="color: darkgrey;"> ${exp.description} </p>
                <b style="color: green;">Amount: ${exp.amount} Rs</b>
                <p style="color: grey;">Date: ${exp.date}</p>
                <i style="color: orangered;">Status: ${exp.status === 'true' ? 'paid' : 'unpaid'}</i>
            </li> `,
        '');

    const body = `
        <div style="margin-top: 20px;">
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;">
                    <div style="color: rgb(14, 46, 95); font-size: 25px; font-weight: bold; text-overflow: ellipsis;">${category}</div>
                    <span style="color: grey;">${catSummary.count} Total</span>
                </div>
                <b style="color: rgba(14, 46, 95, 0.7); margin-right: 10px; margin-top: 5px;font-size: 18px;">${catSummary.totalAmount} Rs Total</b>
            </div>
            <ol>
                ${expList}
            </ol>
        </div>
    `;
    return body;
}

export const generateHtmlForAllExpenses = (allExpenses, expenseSummary, status, month) => {
    const getExpenseSummary = (category) => {
        if (!expenseSummary || expenseSummary.length <= 0 || !category || category === 'All') return null;
        return expenseSummary.find(e => e.category === category);
    }
    const body = Object.keys(allExpenses).reduce((catDiv, category) => {
        const catSummary = getExpenseSummary(category);
        return catDiv + generateHtmlForExpenseCategory(allExpenses[category].expenseList, catSummary, category);
    }, '');

    return generateHtmlTemplate('My Expenses', body, status, month);
}

export const generateHtmlForExpenseSearchRes = (expenseList, expensesSummary, dates, searchQuery, status, sort) => {
    let income = `${expensesSummary.income.total}Rs (${expensesSummary.income.count})`;
    let expenditure = `${expensesSummary.totalExpense}Rs (${expensesSummary.expenseCount})`;
    if (status === 'all') {
        income += - ' [';
        if (expensesSummary.income.paidAmount) {
            income += `${expensesSummary.income.paidAmount}Rs (${expensesSummary.income.paidCount}) P`;
        }
        if (expensesSummary.income.unpaidAmount) {
            income += ` ${expensesSummary.income.unpaidAmount}Rs (${expensesSummary.income.unpaidCount}) U ]`;
        }
        income += ']';

        expenditure += - ' [';
        if (expensesSummary.income.paidAmount) {
            expenditure += `${expensesSummary.expSumDetail.paidExpenseTotal}Rs (${expensesSummary.expSumDetail.paidExpenseCount}) P`;
        }
        if (expensesSummary.income.unpaidAmount) {
            expenditure += ` ${expensesSummary.expSumDetail.unpaidExpenseTotal}Rs (${expensesSummary.expSumDetail.unpaidExpenseCount}) U ]`;
        }
        expenditure += ']';
    }

    const expList = expenseList.reduce((expLi, exp) => expLi + ` <li>
                <h3 style="font-weight: bold;">${exp.title}</h3>
                <p style="color: darkgrey;"> ${exp.description} </p>
                <b style="color: green;">Amount: ${exp.amount} Rs</b>
                <p style="color: grey;">Date: ${exp.date}</p>
                <i style="color: orangered;">Status: ${exp.status === 'true' ? 'paid' : 'unpaid'}</i>
            </li> 
    `, '');
    const body = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="padding-bottom: 20px;">
                    <p style="font-weight: bold; margin-bottom: 10px; margin-top: 0;">From:</p>
                    <span style="border: 2px solid rgb(252, 102, 43); padding: 8px 10px; border-radius: 6px;">${dates.from}</span>
                </span>
                <b style="padding: 0 10px;">-></b>
                <span style="padding-bottom: 20px;">
                    <p style="font-weight: bold; margin-bottom: 10px; margin-top: 0;">To:</p>
                    <span style="border: 2px solid rgb(252, 102, 43); padding: 8px 10px; border-radius: 6px;">${dates.to}</span>
                </span>
            </div>
            <span style="flex: 1; font-size: 18px; color: rgb(252, 102, 43); text-align: center; padding: 0 15px;">${searchQuery}</span>
            <span style="color: rgb(244, 50, 50);"><b>Status:</b> ${status === 'true' ? 'PAID' : status === 'false' ? 'UNPAID' : 'ALL'} </span>
            <span style="color: rgb(244, 50, 50);">${sort} </span>
        </div>
        <div style="margin-bottom: 50px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: rgb(244, 50, 50); margin: 0 10px;"><b>Total Income: </b> ${income} </span>
            <span style="color: rgb(244, 50, 50); margin: 0 10px;"><b>Total Expense: </b> ${expenditure} </span>
        </div>
        <div style="margin-top: 20px;">
            <ol>
                ${expList}
            </ol>
        </div>   
    `;
    return generateHtmlTemplate('Searched Expenses', body);
}

export const getUniqueId = (length)=>{
    const id = Math.random().toString(16).slice(2);
    if(length){
        length = length > 12 ? 12 : length;
        return id.slice(0, length-1);
    }
    return id;
    // return crypto.randomUUID();
}

export const initDB = async () => {
    return init();
};

// export const shareFile = async (uri) => {
//     try {
//         await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
//         return { status: true };
//     } catch (err) {
//         showToastMessage('Unable to share this file', 'bottom', 'long');
//         console.log(err.message);
//         throw new Error(err.message);
//     }
// }

// export const printToFile = async (html, print = false) => {
//     if (print) {
//         await Print.printAsync({ html });
//         return;
//     }
//     const { uri } = await Print.printToFileAsync({ html });
//     console.log('File has been saved to:', uri);
//     await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
// }