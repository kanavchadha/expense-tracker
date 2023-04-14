import { useState, useCallback } from "react";
import { View, Alert, ActivityIndicator, Text } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import ExpenseList from "./ExpenseList";
import OptionsBar from "./OptionsBar";
import { COLORS, FONTS } from "../constants";
import { useFocusEffect } from '@react-navigation/native';
import { showToastMessage, generateHtmlForAllExpenses, generateHtmlForExpenseCategory, generateHtmlTemplate } from "../helpers";
import { getExpensesCategoryGrouped, updateExpense, removeExpense } from "../DB";
import InvestmentDetailsModal from "./Investment/InvestmentDetails";

export default IncomingExpenses = ({ selectedCategory, month, setMonth }) => {
    const [allExpenses, setAllExpenses] = useState({});
    const [expenseSummary, setExpenseSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('false');
    const [selectedInvestmentId, setSelectedInvestmentId] = useState(false);

    const onLoad = async () => {
        setLoading(true);
        getExpensesCategoryGrouped(status, month).then(res => {
            setExpenseSummary(res.expenseCategoriesTotal);
            delete res['expenseCategoriesTotal'];
            setAllExpenses(res);
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Error occured while reading data. ' + err.message);
        })
    }

    useFocusEffect(
        useCallback(() => {
            onLoad();
        }, [status, month])
    );

    const getExpenseSummary = (category) => {
        if (!expenseSummary || expenseSummary.length <= 0 || !category || category === 'All') return null;
        return expenseSummary.find(e => e.category === category);
    }

    const renderAllExpenses = () => {
        const expenseCategories = Object.keys(allExpenses).sort().filter(cat => cat !== 'Monthly Income');
        if (expenseCategories.length <= 0) return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 60 }}>
                <Text style={{ color: COLORS.primary, ...FONTS.h3 }}>No Record</Text>
            </View>
        )

        return expenseCategories.map(category => {
            const catSummary = getExpenseSummary(category);
            return <ExpenseList
                key={category}
                expenses={allExpenses[category].expenseList}
                title={category}
                expenseCount={catSummary ? catSummary.count : 0}
                expenseTotal={catSummary ? catSummary.totalAmount : 0}
                status={status}
                month={month}
                updateExpenseList={updateExpenseList}
                deleteExpense={deleteExpense}
                setExpensePaid={setExpensePaid}
                showInvestmentDetails={showInvestmentDetails}
            />
        })
    }

    const updateExpenseList = (category, expenses) => {
        setAllExpenses(prevState => ({
            ...prevState,
            [category]: {
                category: category,
                expenseList: [...prevState[category].expenseList, ...expenses]
            }
        }))
    }

    const deleteExpense = async (id) => {
        try {
            const res = await removeExpense(id);
            if (res.rowsAffected !== 1) throw new Error('Error in Deleting Data');
            showToastMessage('Expense deleted successfully', 'bottom', 'long');
            onLoad();
            return true;
        } catch (err) {
            Alert.alert('Something went wrong!', 'Unable to delete expense. ' + err.message);
            return false;
        }
    }

    const setExpensePaid = async (item) => {
        try {
            const res = await updateExpense(item.title, item.category, item.amount, item.date, item.description, 'true', item.id);
            if (res.rowsAffected !== 1) throw new Error('Error in updating Data!');
            showToastMessage('Expense Set to Paid', 'bottom', 'long');
            onLoad();
        } catch (err) {
            Alert.alert('Something went wrong!', 'Unable to update expense. ' + err.message);
        }
    }
    const downloadAllExpenses = async () => {
        try {
            showToastMessage('Downloading Started...', 'bottom', 'short');
            let html = '';
            if (selectedCategory && selectedCategory !== 'All') {
                const body = generateHtmlForExpenseCategory(allExpenses[selectedCategory].expenseList, getExpenseSummary(selectedCategory), selectedCategory);
                html = generateHtmlTemplate('My Expenses', body, status, month);
            } else {
                html = generateHtmlForAllExpenses(allExpenses, expenseSummary, status, month);
            }
            const { uri } = await Print.printToFileAsync({ html });
            console.log('File has been saved to:', uri);
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            showToastMessage('Downloading Completed...', 'bottom', 'short');
        } catch (err) {
            showToastMessage('Download Failed...', 'bottom', 'long');
            Alert.alert('Something went wrong!', err.message);
        }
    }

    const showInvestmentDetails = (id)=>{
        setSelectedInvestmentId(id);
    }

    const summary = getExpenseSummary(selectedCategory);
    return (
        <View>
            {!loading && <OptionsBar status={status} setStatus={setStatus} onPressDownload={downloadAllExpenses} month={month} setMonth={setMonth} />}
            {
                loading || !allExpenses ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                    selectedCategory === 'All' ?
                        renderAllExpenses() :
                        <ExpenseList
                            expenses={allExpenses[selectedCategory] ? allExpenses[selectedCategory].expenseList : []}
                            title={selectedCategory}
                            expenseCount={summary ? summary.count : 0}
                            expenseTotal={summary ? summary.totalAmount : 0}
                            status={status}
                            month={month}
                            updateExpenseList={updateExpenseList}
                            deleteExpense={deleteExpense}
                            setExpensePaid={setExpensePaid}
                            showInvestmentDetails={showInvestmentDetails}
                        />
            }
            <InvestmentDetailsModal id={selectedInvestmentId} setShowDetails={setSelectedInvestmentId} />
        </View>
    )
}