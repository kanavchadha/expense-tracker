import * as SQLite from 'expo-sqlite';
import { deleteAllExpenseData, insertExpense, updateExpense, getExpensesCategoryGrouped, getExpenseById, getExpensesByCategory, getExpensesByDate, getExpenseByTitleOrDescription, getUnpaidExpenses, removeExpense, getExpenseSummary, generateOverallExpenseSummary, getSearchResSummary, getMonthlyExpenseAnalysis, getMonthStartEndDate } from './expenses';
import { deleteAllInvestmentData, insertInvestment, updateInvestment, removeInvestment, getInvestmentsSummary, getInvestmentsCategoryGrouped, getInvestmentById, getInvestmentsByCategory, } from './investments';

export const db = SQLite.openDatabase('ExpenseTracker.db');

export const init = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => { // for creating queries. if some part of query fails, it rollback whole query.
            tx.executeSql('CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL );',
                [],
                () => { console.log('Created Expense Table successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS investment (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, reference TEXT, category TEXT NOT NULL, amount REAL NOT NULL, startDate TEXT NOT NULL, timePeriod REAL NOT NULL, interest REAL NOT NULL );',
                [],
                () => { console.log('Created Investment Table successfully!'); },
                (_, err) => { reject(err) },
            );
        },
            (err) => { reject(err) },
            () => { resolve('Intialized DB Successfully!') }
        )
    });
    return promise;
}

export {
    // -------------------------------- EXPENSES --------------------------------------
    deleteAllExpenseData,
    insertExpense,
    updateExpense,
    getExpensesCategoryGrouped,
    getExpenseById,
    getExpensesByCategory,
    getExpensesByDate,
    getExpenseByTitleOrDescription,
    getUnpaidExpenses,
    removeExpense,
    getExpenseSummary,
    generateOverallExpenseSummary,
    getSearchResSummary,
    getMonthlyExpenseAnalysis,
    getMonthStartEndDate,

    // -------------------------------- INVESTMENTS --------------------------------------
    deleteAllInvestmentData,
    insertInvestment,
    updateInvestment,
    removeInvestment,
    getInvestmentsSummary,
    getInvestmentsCategoryGrouped,
    getInvestmentById,
    getInvestmentsByCategory,
}



