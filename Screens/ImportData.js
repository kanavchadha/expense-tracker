import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Linking, Switch } from 'react-native';
import { COLORS, FONTS } from "../constants";
import FormModal from "../Components/FormModal";
import { Feather } from '@expo/vector-icons';
import { insertExpense, insertInvestment } from "../DB";
import { delay, getUniqueId } from "../helpers";

const ImportDataScreen = () => {
    const [category, setCategory] = useState('Expenses');
    const [createInvExpenses, setCreateInvExpenses] = useState(true);
    const [inputData, setInputData] = useState('');
    const [importProgress, setImportProgress] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [recordsNum, setRecordsNum] = useState(null);
    const [importedDataRes, setImportedDataRes] = useState(null);

    const setDataCategory = () => {
        setCategory((prevState => {
            if (prevState === 'Expenses') return 'Investments';
            else return 'Expenses';
        }))
    }

    const clearData = () => {
        setInputData('');
        setImportProgress(null);
        setImportedDataRes(null);
        setRecordsNum(null);
    }

    const updateProgressBar = (num, text, totalRecords) => {
        if (!totalRecords) return;
        const increment = 100 / totalRecords;
        setImportProgress(prevState => ({
            num: num,
            length: prevState?.length ? prevState.length + increment : increment,
            text: text ? text : prevState?.text
        }));
    }

    const importData = async (category, data) => {
        const result = {};
        const totalRecords = data.length;
        if (category === 'Expenses') {
            const expRes = [];
            for (let i = 0; i < totalRecords; i++) {
                await delay(25);
                const exp = data[i];
                updateProgressBar(i + 1, `inserting ${exp.title} expense record`, totalRecords);
                if (!exp.title || !exp.category || !exp.amount || !exp.date || !exp.description || !exp.status) throw new Error('All Expense Data is required');
                let res = await insertExpense(exp.title, exp.category, exp.amount, exp.date, exp.description, exp.status, exp.invId);
                if (!res || res.rowsAffected !== 1) throw new Error(`Error occured while inserting expense: ${exp.title}.`);
                expRes.push(res);
            }
            result.expense = expRes;
            if (result.expense.length <= 0) throw new Error('Something went wrong! Cannot insert expenses');
        } else {
            const expRes = [];
            const invRes = [];
            for (let i = 0; i < totalRecords; i++) {
                await delay(25);
                const invRecord = data[i];
                updateProgressBar(i + 1, `inserting ${invRecord.title} investment record`, totalRecords);
                if (!invRecord.title || !invRecord.category || !invRecord.timePeriod || invRecord.investments?.length <= 0 || !invRecord.isActive) throw new Error('All Investment Data is required');
                invRecord.investments?.forEach(inv => {
                    inv.id = getUniqueId(8);
                });
                invRecord.returns?.forEach(ret => {
                    ret.id = getUniqueId(8);
                });
                let res = await insertInvestment(invRecord.title, invRecord.category, invRecord.reference, invRecord.timePeriod, invRecord.investments, invRecord.returns, invRecord.isActive);
                if (!res || !res.insertId || res.rowsAffected !== 1) throw new Error(`Error occured while inserting investment: ${invRecord.title}.`);
                invRes.push(res);
                if (!createInvExpenses) continue;
                //create corressponding expenses
                const invRecordId = res.insertId;
                for (let j = 0; j < invRecord.investments.length; j++) {
                    await delay(10);
                    updateProgressBar(i + 1, `inserting ${invRecord.title} #${j + 1} investment's expense`, totalRecords);
                    const inv = invRecord.investments[j];
                    if (!inv.amount || !inv.date || !inv.id) throw new Error('All Investment-Expense Data is required');
                    let res = await insertExpense(`${invRecord.title} #${j + 1}`, 'Investment', inv.amount, inv.date, inv.id, 'true', invRecordId);
                    if (!res || res.rowsAffected !== 1) throw new Error(`Error occured while inserting investment expense: ${invRecord.title} #${j + 1}.`);
                    expRes.push(res);
                }
                for (let j = 0; j < invRecord.returns.length; j++) {
                    await delay(10);
                    updateProgressBar(i + 1, `inserting ${invRecord.title} Return #${j + 1} investment's income`, totalRecords);
                    const ret = invRecord.returns[j];
                    if (!ret.amount || !ret.date || !ret.id) throw new Error('All Investment-Return Data is required');
                    let res = await insertExpense(`${invRecord.title} Return #${j + 1}`, 'Monthly Income', ret.amount, ret.date, ret.id, 'true', invRecordId);
                    if (!res || res.rowsAffected !== 1) throw new Error(`Error occured while inserting investment income: ${invRecord.title} Return #${j + 1}.`);
                    expRes.push(res);
                }
            }
            result.expense = expRes;
            result.investment = invRes;
            if (result.investment.length <= 0) throw new Error('Something went wrong! Cannot insert investments.');
            if (createInvExpenses && result.expense.length <= 0) throw new Error('Something went wrong! Cannot insert investment expenses.');
        }
        return result;
    }

    const submit = async () => {
        setImportProgress(null);
        setImportedDataRes(null);
        setRecordsNum(null);
        setIsImporting(true);
        let data = null;
        try {
            if (!inputData) throw new Error('Empty Data!');
            data = JSON.parse(inputData.trim());
            if (!data || !Array.isArray(data)) throw new Error('Invalid Data!');
        } catch (error) {
            setIsImporting(false);
            throw new Error('Please enter valid json data for importing records!');
        }
        try {
            setRecordsNum(data.length);
            const res = await importData(category, data);
            setImportedDataRes({ type: 'SUCCESS', expRecords: res.expense?.length, invRecords: res.investment?.length });
            setImportProgress({num: data.length, length: 100, text: 'Imported All Records!'});
            setIsImporting(false);
        } catch (err) {
            setImportedDataRes({ type: 'FAILED', error: err.message });
            setIsImporting(false);
            throw err;
        }
    }

    return (
        <FormModal title={'Import Data'} submit={submit} successMsg={`Imported ${category} data successfully`} submitBtnText='Import'>
            <TouchableOpacity style={styles.tab} activeOpacity={0.5} onPress={setDataCategory} disabled={isImporting}>
                <View style={{ ...styles.tabBtn, backgroundColor: category === 'Expenses' ? COLORS.darkgreen : COLORS.white, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}>
                    <Text style={{ ...styles.tabBtnText, color: category === 'Expenses' ? COLORS.white : COLORS.black }}>Expenses</Text>
                </View>
                <View style={{ ...styles.tabBtn, backgroundColor: category === 'Investments' ? COLORS.darkgreen : COLORS.white, borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}>
                    <Text style={{ ...styles.tabBtnText, color: category === 'Investments' ? COLORS.white : COLORS.black }}>Investments</Text>
                </View>
            </TouchableOpacity>
            {category === 'Investments' &&
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.tabBtnText}> Create Investment Expenses? : </Text>
                    <Switch value={createInvExpenses} onValueChange={(value) => setCreateInvExpenses(value)} thumbColor={createInvExpenses ? COLORS.darkgreen : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.olive }} />
                </View>
            }
            <View>
                <Text style={styles.text}>Convert Youd PDF data into json with this
                    <Text style={styles.link} onPress={() => Linking.openURL('https://expenso-pdf-parser.cyclic.cloud')}> tool</Text>.
                </Text>
                <TextInput style={styles.textArea}
                    multiline={true}
                    numberOfLines={12}
                    keyboardType="default"
                    inputMode="text"
                    onChangeText={(text) => setInputData(text)}
                    value={inputData}
                    placeholder={`Please paste you ${category} data here...`}
                />
                {inputData ? <Feather onPress={clearData} style={styles.delIcon} name="delete" size={22} color={COLORS.danger} /> : null}
            </View>
            {
                (importProgress !== null && recordsNum !== null) ?
                    <View style={styles.importProcess}>
                        <Text style={styles.text}> Started importing {category} data... </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, }}>
                            <View style={{ ...styles.progressBar, flex: importProgress.length / 100 }} />
                            <Text style={{ marginLeft: 2, fontSize: 12 }} numberOfLines={1}>{importProgress.num}/{recordsNum}</Text>
                        </View>
                        <Text style={styles.progressText} numberOfLines={2}> - {importProgress.text} </Text>
                    </View>
                    : null
            }
            {
                importedDataRes ? importedDataRes.type === 'SUCCESS' ?
                    <View style={{ ...styles.resContainer, borderColor: COLORS.darkgreen }}>
                        <Feather name="check-circle" color={COLORS.darkgreen} size={55} style={{ margin: 6 }} />
                        <Text style={{ ...styles.htext, color: COLORS.darkgreen }}>Congrats! Your data is successfully Imported.</Text>
                        {category === 'Expenses' ?
                            <Text style={styles.text}>Total {importedDataRes.expRecords} {category} records are Imported.</Text>
                            : <>
                                <Text style={styles.text}>Total {importedDataRes.invRecords} {category} records are Imported.</Text>
                                <Text style={styles.text}>Total {importedDataRes.expRecords} Expenses records are Imported.</Text>
                            </>
                        }
                    </View> :
                    <View style={{ ...styles.resContainer, borderColor: COLORS.danger }}>
                        <Feather name="x-circle" color={COLORS.danger} size={55} style={{ margin: 6 }} />
                        <Text style={{ ...styles.htext, color: COLORS.danger }}>Sorry! Something went wrong!!</Text>
                        <Text style={styles.text}>Couldn't import your {category} data. Error: {importedDataRes.error} </Text>
                    </View> : null
            }
        </FormModal >
    )
}

const styles = StyleSheet.create({
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15
    },
    tabBtn: {
        padding: 6,
        backgroundColor: COLORS.white,
        borderColor: COLORS.darkgray,
        borderWidth: 1,
    },
    tabBtnText: {
        fontSize: FONTS.h4.fontSize,
        fontFamily: FONTS.h4.fontFamily,
    },
    textArea: {
        textAlignVertical: 'top',
        borderWidth: 6,
        borderColor: COLORS.darkgreen,
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
        marginHorizontal: 20,
        ...FONTS.body3
    },
    delIcon: {
        position: 'absolute',
        right: 5,
        top: 20
    },
    htext: {
        fontSize: FONTS.h3.fontSize,
        fontFamily: FONTS.h3.fontFamily,
        textAlign: 'center',
        marginVertical: 5,
        alignItems: 'center'
    },
    text: {
        fontSize: FONTS.body4.fontSize,
        fontFamily: FONTS.body4.fontFamily,
        textAlign: 'center'
    },
    link: {
        color: COLORS.steelblue,
        textShadowOffset: { width: 0.5, height: 0.5 },
        textShadowColor: COLORS.black,
        textShadowRadius: 1,
        letterSpacing: 0.5,
        fontSize: 15
    },
    importProcess: {
        margin: 15,
        borderTopWidth: 1.5,
        borderTopColor: COLORS.darkgray,
        paddingTop: 15,
        borderRadius: 1
    },
    progressBar: {
        borderRadius: 5,
        height: 6,
        backgroundColor: COLORS.darkgreen
    },
    resContainer: {
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
        marginTop: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontFamily: FONTS.body4.fontFamily,
        paddingHorizontal: 5
    }
});

export default ImportDataScreen;
