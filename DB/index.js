import { init, clearDB } from './db';
import { deleteAllExpenseData, insertExpense, updateExpense, updateExpenseByInvId, getExpensesCategoryGrouped, getExpenseById, getExpensesByCategory, getExpensesByDate, getExpenseByTitleOrDescription, getUnpaidExpenses, removeExpense, removeExpenseByInvId, getExpenseSummary, generateOverallExpenseSummary, getSearchResSummary, getMonthlyExpenseAnalysis, getMonthStartEndDate } from './expenses';
import { deleteAllInvestmentData, insertInvestment, updateInvestment, removeInvestment, getInvestmentsSummary, getInvestmentsCategoryGrouped, getInvestmentById, getInvestmentsByCategory, generateOverallInvestmentSummary } from './investments';


export {
    init,
    clearDB,

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
    removeExpenseByInvId,
    updateExpenseByInvId,

    // -------------------------------- INVESTMENTS --------------------------------------
    deleteAllInvestmentData,
    insertInvestment,
    updateInvestment,
    removeInvestment,
    getInvestmentsSummary,
    getInvestmentsCategoryGrouped,
    getInvestmentById,
    getInvestmentsByCategory,
    generateOverallInvestmentSummary
}



