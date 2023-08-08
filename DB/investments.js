import { db } from './db';
import { investmentCategoryOptions } from '../constants';

export const deleteAllInvestmentData = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('DROP TABLE IF EXISTS investment', [],
                () => { console.log('Deleted Investment data successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS investment (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, reference TEXT, category TEXT NOT NULL, investments TEXT NOT NULL, startDate TEXT NOT NULL, timePeriod REAL NOT NULL, returns TEXT NOT NULL, isActive TEXT NOT NULL, totalInvAmount REAL NOT NULL, totalRetAmount REAL NOT NULL, totalInvCount INTEGER NOT NULL, totalRetCount INTEGER NOT NULL );', [],
                () => { console.log('Created New Investment Table successfully!'); },
                (_, err) => { reject(err) },
            );
        },
            (err) => { reject(err) },
            () => { resolve('Deleted Investments Data!') }
        )
    });
    return promise;
}

export const insertInvestment = async (title, category, reference, time, investments, returns, isActive) => {
    const startDate = investments[0].date.toISOString();
    const invTotal = investments.reduce((val, inv) => (val + (Math.round(Number(inv.amount) * 100) / 100)), 0);
    const retTotal = returns.reduce((val, ret) => (val + (Math.round(Number(ret.amount) * 100) / 100)), 0);
    const invCount = investments.length;
    const retCount = returns.length;
    investments = JSON.stringify(investments);
    returns = JSON.stringify(returns);
    isActive = isActive ? 'true' : 'false';

    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO investment (title, reference, category, timePeriod, investments, returns, startDate, isActive, totalInvAmount, totalRetAmount, totalInvCount, totalRetCount) VALUES (?, ?, ?, ?, ?, ?, datetime(?, 'localtime'), ?, ?, ?, ?, ?);`,
                [title, reference, category, time, investments, returns, startDate, isActive, invTotal, retTotal, invCount, retCount],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const updateInvestment = async (title, category, reference, time, investments, returns, isActive, id) => {
    const startDate = investments[0].date.toISOString();
    const invTotal = investments.reduce((val, inv) => (val + (Math.round(Number(inv.amount) * 100) / 100)), 0);
    const retTotal = returns.reduce((val, ret) => (val + (Math.round(Number(ret.amount) * 100) / 100)), 0);
    const invCount = investments.length;
    const retCount = returns.length;
    investments = JSON.stringify(investments);
    returns = JSON.stringify(returns);
    isActive = isActive ? 'true' : 'false';

    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`UPDATE investment SET title = ?, reference = ?, category = ?, timePeriod = ?, investments = ?, returns = ?, startDate = datetime(?, 'localtime'), isActive = ?, totalInvAmount = ?, totalRetAmount = ?, totalInvCount = ?, totalRetCount = ? WHERE id = ?;`,
                [title, reference, category, time, investments, returns, startDate, isActive, invTotal, retTotal, invCount, retCount, id],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const removeInvestment = async (id) => {
    const promise = new Promise((resolve, reject) => {
        const res = {};
        db.transaction((tx) => {
            tx.executeSql(`DELETE FROM investment WHERE id = ?;`,
                [parseInt(id)],
                (_, result) => { res.investment = result },
                (_, err) => { reject(err) },
            );
            tx.executeSql(`DELETE FROM expense WHERE invId = ?;`,
                [parseInt(id)],
                (_, result) => { res.expense = result },
                (_, err) => { reject(err) },
            );
        }, (err) => { reject(err) },
            () => { resolve(res) }
        )
    });
    return promise;
}

export const getInvestmentById = async (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM investment where id = ?;',
                [id],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getInvestmentsByCategory = async (category, startDate, endDate, filter, limit, offset, order) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT * FROM investment WHERE category = ? AND (julianday(startDate) >= julianday(?) AND julianday(startDate) <= julianday(?)) `;
            if (filter === 'active') {
                query += `AND isActive = 'true' `;
            } else if (filter === 'matured') {
                query += `AND isActive = 'false' `;
            }
            query += `ORDER BY ${order} DESC LIMIT ? OFFSET ?;`
            tx.executeSql(query,
                [category, startDate, endDate, limit, offset],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getInvestmentsCategoryGrouped = async (startDate, endDate, filter, order, limit = 10, withSumm = true) => {
    const promise = new Promise((resolve, reject) => {
        const investmentsByCategory = {};
        db.transaction((tx) => {
            let query = `SELECT * FROM investment WHERE category = ? AND (julianday(startDate) >= julianday(?) AND julianday(startDate) <= julianday(?)) `;
            let summQuery = `SELECT category, SUM(totalInvAmount) AS totalInvested, SUM(totalRetAmount) AS totalReturns, SUM(totalInvCount) AS invCount, SUM(totalRetCount) AS retCount, COUNT(id) AS count FROM investment WHERE julianday(startDate) >= julianday(?) AND julianday(startDate) <= julianday(?) `;
            if (filter === 'active') {
                summQuery += `AND isActive = 'true' `;
                query += `AND isActive = 'true' `;
            } else if (filter === 'matured') {
                summQuery += `AND isActive = 'false' `;
                query += `AND isActive = 'false' `;
            }
            query += `ORDER BY ${order} LIMIT ?;`;
            summQuery += `GROUP BY category;`;

            if (withSumm) {
                tx.executeSql(summQuery,
                    [startDate, endDate],
                    (_, result) => { investmentsByCategory.investmentCategoriesTotal = result.rows._array },
                    (_, err) => { reject(err) },
                );
            }

            investmentCategoryOptions.forEach(category => {
                if (category.value === 'Category') return;
                tx.executeSql(query,
                    [category.value, startDate, endDate, limit],
                    (_, result) => {
                        if (result.rows && result.rows._array.length > 0)
                            investmentsByCategory[category.value] = { category: category.value, investmentList: result?.rows?._array };
                    },
                    (_, err) => { reject(err) },
                );
            })
        },
            (err) => { reject(err) },
            () => { resolve(investmentsByCategory) }
        )
    });
    return promise;
}

export const getInvestmentsSummary = async (startDate, endDate, filter) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT category, isActive, SUM(totalInvAmount) AS totalInvested, SUM(totalRetAmount) AS totalReturns, SUM(totalInvCount) AS invCount, SUM(totalRetCount) AS retCount, COUNT(id) AS count FROM investment WHERE (julianday(startDate) >= julianday(?) AND julianday(startDate) <= julianday(?)) `;
            if (filter === 'active') {
                query += `AND isActive = 'true' `;
            } else if (filter === 'matured') {
                query += `AND isActive = 'false' `;
            } else {
                query += `AND (isActive = 'false' OR isActive = 'true') `;
            }
            query += `GROUP BY category, isActive;`;
            tx.executeSql(query,
                [startDate, endDate],
                (_, result) => { resolve(result.rows._array) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const generateOverallInvestmentSummary = async (filter) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT category, isActive, SUM(totalInvAmount) AS totalInvested, SUM(totalRetAmount) AS totalReturns, SUM(totalInvCount) AS invCount, SUM(totalRetCount) AS retCount, COUNT(id) AS count FROM investment WHERE `;
            if (filter === 'active') {
                query += `isActive = 'true' `;
            } else if (filter === 'matured') {
                query += `isActive = 'false' `;
            } else {
                query += `(isActive = 'false' OR isActive = 'true') `;
            }
            query += `GROUP BY category, isActive;`;
            tx.executeSql(query,
                [],
                (_, result) => { resolve(result.rows._array) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}