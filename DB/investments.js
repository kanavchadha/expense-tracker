import { db } from './index';
import { investmentCategoryOptions } from '../constants';

export const deleteAllInvestmentData = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('DROP TABLE IF EXISTS investment', [],
                () => { console.log('Deleted Investment data successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS investment (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, reference TEXT, category TEXT NOT NULL, amount REAL NOT NULL, startDate TEXT NOT NULL, timePeriod REAL NOT NULL, interest REAL NOT NULL );', [],
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

export const insertInvestment = async (title, category, amount, date, reference, time, interest) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => { // for creating queries. if some part of query fails, it rollback whole query.
            tx.executeSql(`INSERT INTO investment (title, reference, category, amount, startDate, timePeriod, interest) VALUES (?, ?, ?, ?, datetime(?, 'localtime'), ?, ?);`, // here we insert question marks instead of adding values directly because to prevent sql injection. 
                [title, reference, category, amount, date, time, interest], // we pass our args here, as it now first validates thse args i.e these args should not be a valid sql statement, and then it will be replaces the ?, hence we can prevent sql injections.
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const updateInvestment = async (title, category, amount, date, reference, time, interest, id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`UPDATE investment SET title = ?, category = ?, reference = ?, amount = ?, startDate = datetime(?, 'localtime'), timePeriod = ? interest = ? WHERE id = ?;`,
                [title, category, reference, amount, date, time, interest, id],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const removeInvestment = async (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`DELETE FROM investment WHERE id = ?;`,
                [parseInt(id)],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getInvestmentsSummary = async (startDate, endDate) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`SELECT category, SUM(amount) AS total, COUNT(id) AS count FROM investment WHERE (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) GROUP BY category;`,
                [startDate, endDate],
                (_, result) => { resolve(result.rows._array) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getInvestmentsCategoryGrouped = async (startDate, endDate, order) => {
    const promise = new Promise((resolve, reject) => {
        const investmentsByCategory = {};
        db.transaction((tx) => {
            tx.executeSql(`SELECT category, SUM(amount) AS totalAmount, COUNT(id) AS count FROM investment WHERE julianday(date) >= julianday(?) AND julianday(date) <= julianday(?) GROUP BY category ORDER BY ${order} LIMIT 25 `,
                [startDate, endDate],
                (_, result) => { investmentsByCategory.categoryTotal = result.rows._array },
                (_, err) => { reject(err) },
            );
            investmentCategoryOptions.forEach(category => {
                if (category.value === 'Category') return;
                tx.executeSql(`SELECT * FROM investment WHERE category = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) ORDER BY ${order} LIMIT 25`,
                    [category.value, startDate, endDate],
                    (_, result) => {
                        if (result.rows && result.rows._array.length > 0) {
                            investmentsByCategory[category.value] = { category: category.value, investmentList: result.rows._array };
                        }
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

export const getInvestmentsByCategory = async (category, startDate, endDate, limit, offset, order) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT * FROM investment WHERE category = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) ORDER BY ${order} DESC LIMIT ? OFFSET ?;`;
            tx.executeSql(query,
                [category, startDate, endDate, limit, offset],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}