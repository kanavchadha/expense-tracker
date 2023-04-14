import { db } from './db';
import { categoryOptions } from '../constants';

export const deleteAllExpenseData = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('DROP TABLE IF EXISTS expense', [],
                () => { console.log('Deleted Expenses data successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, invId INTEGER);', [],
                () => { console.log('Created New Expenses Table successfully!'); },
                (_, err) => { reject(err) },
            );
        },
            (err) => { reject(err) },
            () => { resolve('Deleted Expenses Data!') }
        )
    });
    return promise;
}

export const insertExpense = async (title, category, amount, date, description, status, invId = null) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => { // for creating queries. if some part of query fails, it rollback whole query.
            tx.executeSql(`INSERT INTO expense (title, category, amount, date, description, status, invId) VALUES (?, ?, ?, datetime(?, 'localtime'), ?, ?, ?);`, // here we insert question marks instead of adding values directly because to prevent sql injection. 
                [title, category, amount, date, description, status, invId], // we pass our args here, as it now first validates thse args i.e these args should not be a valid sql statement, and then it will be replaces the ?, hence we can prevent sql injections.
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const updateExpense = async (title, category, amount, date, description, status, id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`UPDATE expense SET title = ?, category = ?, amount = ?, date = datetime(?, 'localtime'), description = ?, status = ? WHERE id = ?;`,
                [title, category, amount, date, description, status, id],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getExpensesCategoryGrouped = async (status = 'false', month = null) => {
    const promise = new Promise((resolve, reject) => {
        const expensesByCategory = {};
        const monthDate = getMonthStartEndDate(month);
        let status2 = status;
        db.transaction((tx) => {
            let query = `SELECT category, SUM(amount) AS totalAmount, COUNT(id) AS count FROM expense WHERE status = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) GROUP BY category;`
            if (status === 'all') {
                status = 'false';
                query = `SELECT category, SUM(amount) AS totalAmount, COUNT(id) AS count FROM expense WHERE (status = ? OR status = 'true') AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) GROUP BY category;`
            }
            tx.executeSql(query,
                [status, monthDate.startDate, monthDate.endDate],
                (_, result) => { expensesByCategory.expenseCategoriesTotal = result.rows._array },
                (_, err) => { reject(err) },
            );
            categoryOptions.forEach(category => {
                if (category.value === 'Category') return;
                let query2 = `SELECT * FROM expense WHERE category = ? AND status = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) ORDER BY id DESC LIMIT 10;`;
                if (status2 === 'all') {
                    query2 = `SELECT * FROM expense WHERE category = ? AND (status = ? OR status = 'true') AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) ORDER BY id DESC LIMIT 10;`;
                }
                tx.executeSql(query2,
                    [category.value, status, monthDate.startDate, monthDate.endDate],
                    (_, result) => {
                        if (result.rows && result.rows._array.length > 0) {
                            expensesByCategory[category.value] = { category: category.value, expenseList: result.rows._array };
                        }
                    },
                    (_, err) => { reject(err) },
                );
            })
        },
            (err) => { reject(err) },
            () => { resolve(expensesByCategory) }
        )
    });
    return promise;
}

export const getExpenseById = async (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM expense where id = ?;',
                [id],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getExpensesByCategory = async (category, limit, offset, status = 'false', month = null) => {
    const promise = new Promise((resolve, reject) => {
        const monthDate = getMonthStartEndDate(month);
        db.transaction((tx) => {
            let query = `SELECT * FROM expense WHERE category = ? AND status = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) ORDER BY id DESC LIMIT ? OFFSET ?;`;
            if (status === 'all') {
                status = 'false';
                query = `SELECT * FROM expense WHERE category = ? AND (status = ? OR status = 'true') AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) ORDER BY id DESC LIMIT ? OFFSET ?;`
            }
            tx.executeSql(query,
                [category, status, monthDate.startDate, monthDate.endDate, limit, offset],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getExpensesByDate = async (startDate, endDate, status, limit, offset, order) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT * FROM expense WHERE julianday(date) >= julianday(?) AND julianday(date) <= julianday(?) AND status = ? ORDER BY ${order} LIMIT ? OFFSET ?;`;
            if (status === 'all') {
                status = 'false';
                query = `SELECT * FROM expense WHERE julianday(date) >= julianday(?) AND julianday(date) <= julianday(?) AND (status = ? OR status = 'true') ORDER BY ${order} LIMIT ? OFFSET ?;`;
            }
            tx.executeSql(query,
                [startDate, endDate, status, limit, offset],
                (_, result) => { resolve({ expenses: result.rows._array }) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getExpenseByTitleOrDescription = async (value, fromDate, toDate, status, limit, offset, order) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT * FROM expense where (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) AND (title LIKE ? OR description LIKE ?) AND status = ? ORDER BY ${order} LIMIT ? OFFSET ?;`;
            if (status === 'all') {
                status = 'false';
                query = `SELECT * FROM expense where (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) AND (title LIKE ? OR description LIKE ?) AND (status = ? OR status = 'true') ORDER BY ${order} LIMIT ? OFFSET ?;`;
            }
            tx.executeSql(query,
                [fromDate, toDate, `%${value}%`, `%${value}%`, status, limit, offset],
                (_, result) => { resolve({ expenses: result.rows._array }) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getUnpaidExpenses = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM expense where status = 'false';`,
                [],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const removeExpense = async (id) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`DELETE FROM expense WHERE id = ?;`,
                [parseInt(id)],
                (_, result) => { resolve(result) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getExpenseSummary = async (status = 'true', month = null) => {
    const promise = new Promise((resolve, reject) => {
        const monthDate = getMonthStartEndDate(month);
        db.transaction((tx) => {
            let query = `SELECT category, status, SUM(amount) AS total, COUNT(id) AS count FROM expense WHERE status = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) GROUP BY category, status;`;
            if (status === 'all') {
                status = 'false';
                query = `SELECT category, status, SUM(amount) AS total, COUNT(id) AS count FROM expense WHERE (status = ? OR status = 'true') AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) GROUP BY category, status;`;
            }
            tx.executeSql(query,
                [status, monthDate.startDate, monthDate.endDate],
                (_, result) => { resolve(result.rows._array) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const generateOverallExpenseSummary = async (status = 'true') => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let query = `SELECT category, status, SUM(amount) AS total, COUNT(id) AS count FROM expense WHERE status = ? GROUP BY category, status;`;
            if (status === 'all') {
                status = 'false';
                query = `SELECT category, status, SUM(amount) AS total, COUNT(id) AS count FROM expense WHERE (status = ? OR status = 'true') GROUP BY category, status;`;
            }
            tx.executeSql(query,
                [status],
                (_, result) => { resolve(result.rows._array) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getSearchResSummary = async (status, fromDate, toDate, value) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            let parameters = [];
            let query = `SELECT category, status, SUM(amount) as total, COUNT(id) as count FROM expense where (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) AND status = ? `;
            if (status === 'all') {
                status = 'false';
                query = `SELECT category, status, SUM(amount) as total, COUNT(id) as count FROM expense where (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) AND (status = ? OR status = 'true') `;
            }
            if (value) {
                query += 'AND (title LIKE ? OR description LIKE ?) GROUP BY category, status;';
                parameters = [fromDate, toDate, status, `%${value}%`, `%${value}%`];
            } else {
                query += 'GROUP BY category, status;';
                parameters = [fromDate, toDate, status];
            }
            tx.executeSql(query,
                parameters,
                (_, result) => { resolve(result.rows._array) },
                (_, err) => { reject(err) },
            );
        })
    });
    return promise;
}

export const getMonthlyExpenseAnalysis = async (month, status = 'all') => {
    const promise = new Promise((resolve, reject) => {
        let currMonthRes, prevMonthRes;
        db.transaction((tx) => {
            const currMonthDate = getMonthStartEndDate(month);
            const prevMonthDate = getMonthStartEndDate(month - 1);

            let query = `SELECT SUM(amount) AS total, COUNT(id) AS count FROM expense WHERE status = ? AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) AND category != 'Monthly Income';`;
            if (status === 'all') {
                status = 'false';
                query = `SELECT SUM(amount) AS total, COUNT(id) AS count FROM expense WHERE (status = ? OR status = 'true') AND (julianday(date) >= julianday(?) AND julianday(date) <= julianday(?)) AND category != 'Monthly Income';`;
            }
            tx.executeSql(query,
                [status, currMonthDate.startDate, currMonthDate.endDate],
                (_, result) => { currMonthRes = result.rows._array[0] },
                (_, err) => { reject(err) },
            );
            tx.executeSql(query,
                [status, prevMonthDate.startDate, prevMonthDate.endDate],
                (_, result) => { prevMonthRes = result.rows._array[0] },
                (_, err) => { reject(err) },
            );
        }, (err) => { reject(err) },
            () => {
                resolve({ currMonthRes, prevMonthRes })
            }
        )
    });
    return promise;
}

export const getMonthStartEndDate = (month) => {
    let date = new Date();
    date = new Date(date.getFullYear(), (month || month === 0) ? month : date.getMonth(), 2);
    date.setUTCHours(0, 0, 0, 0);
    const startDate = date.toISOString();
    date = new Date(date.getFullYear(), (month || month === 0) ? month + 1 : date.getMonth() + 1, 1);
    date.setUTCHours(23, 59, 59, 0);
    const endDate = date.toISOString();
    // console.log(startDate, endDate);
    return { startDate, endDate };
}
