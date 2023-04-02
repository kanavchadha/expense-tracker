import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabase('ExpenseTracker.db');

export const init = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => { // for creating queries. if some part of query fails, it rollback whole query.
            tx.executeSql('CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, invId INTEGER );',
                [],
                () => { console.log('Created Expense Table successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS investment (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, reference TEXT, category TEXT NOT NULL, investments TEXT NOT NULL, startDate TEXT NOT NULL, timePeriod REAL NOT NULL, returns TEXT NOT NULL, isActive TEXT NOT NULL, totalInvAmount REAL NOT NULL, totalRetAmount REAL NOT NULL );',
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

export const clearDB = async () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => { // for creating queries. if some part of query fails, it rollback whole query.
            tx.executeSql('DROP TABLE IF EXISTS expense', [],
                () => { console.log('Deleted Expenses data successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS expense (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, category TEXT NOT NULL, amount REAL NOT NULL, date TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL, invId INTEGER );', [],
                () => { console.log('Created New Expenses Table successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('DROP TABLE IF EXISTS investment', [],
                () => { console.log('Deleted Investment data successfully!'); },
                (_, err) => { reject(err) },
            );
            tx.executeSql('CREATE TABLE IF NOT EXISTS investment (id INTEGER PRIMARY KEY NOT NULL, title  TEXT NOT NULL, reference TEXT, category TEXT NOT NULL, investments TEXT NOT NULL, startDate TEXT NOT NULL, timePeriod REAL NOT NULL, returns TEXT NOT NULL, isActive TEXT NOT NULL, totalInvAmount REAL NOT NULL, totalRetAmount REAL NOT NULL );', [],
                () => { console.log('Created New Investment Table successfully!'); },
                (_, err) => { reject(err) },
            );
        },
            (err) => { reject(err) },
            () => { resolve('Cleared DB Successfully!') }
        )
    });
    return promise;
}
