import React, { useState } from "react";
import { ScrollView, View, Text, ActivityIndicator, Alert } from 'react-native';
import InvestmentList from './InvestmentList';
import OptionsBar from "../OptionsBar";
import { getInvestmentsCategoryGrouped, removeInvestment } from "../../DB";
import { generateHtmlTemplate } from "../../helpers";
import { INVESTMENT_FILTERS, INVESTMENT_SORT_OPTIONS } from "../../constants/data";

const CURR_DATE = new Date();
const CURR_END_DATE = new Date();
CURR_DATE.setUTCHours(0, 0, 0);
CURR_END_DATE.setMonth(0);
CURR_END_DATE.setDate(0);
CURR_END_DATE.setUTCHours(23, 59, 59);

const Investments = ({ fromDate, toDate, selectedCategory, status, setStatus }) => {
    const [allInvestments, setAllInvestments] = useState({});
    const [investmentSummary, setInvestmentSummary] = useState([]);
    const [order, setOrder] = useState('id DESC');
    const [loading, setLoading] = useState(false);

    const onLoad = async () => {
        setLoading(true);
        getInvestmentsCategoryGrouped(fromDate, toDate).then(res => {
            setInvestmentSummary(res.investmentCategoriesTotal);
            delete res['investmentCategoriesTotal'];
            setAllInvestments(res);
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            Alert.alert('Something went wrong!', 'Error occured while reading data. ' + err.message);
        })
    }

    useFocusEffect(
        useCallback(() => {
            onLoad();
        }, [status, fromDate.toISOString(), toDate.toISOString()])
    );

    const getInvestmentSummary = (category) => {
        if (!investmentSummary || investmentSummary.length <= 0 || !category || category === 'All') return null;
        return investmentSummary.find(e => e.category === category);
    }

    const renderAllInvestments = () => {
        const investmentCategories = Object.keys(allInvestments).sort();
        if (investmentCategories.length <= 0) return (
            <View style={{ alignItems: 'center', justifyContent: 'center', height: 60 }}>
                <Text style={{ color: COLORS.primary, ...FONTS.h3 }}>No Record</Text>
            </View>
        )

        return investmentCategories.map(category => {
            const catSummary = getInvestmentSummary(category);
            return <InvestmentList
                key={category}
                expenses={allInvestments[category].expenseList}
                title={category}
                expenseCount={catSummary ? catSummary.count : 0}
                expenseTotal={catSummary ? catSummary.totalAmount : 0}
                month={month}
                updateExpenseList={updateInvestmentList}
                deleteExpense={deleteInvestment}
            />
        })
    }

    const updateInvestmentList = (category, investments) => {
        setAllInvestments(prevState => ({
            ...prevState,
            [category]: {
                category: category,
                investmentList: [...prevState[category].investmentList, ...investments]
            }
        }))
    }

    const deleteInvestment = async (id) => {
        try {
            const res = await removeInvestment(id);
            if (res.rowsAffected !== 1) throw new Error('Error in Deleting Data');
            showToastMessage('Investment deleted successfully', 'bottom', 'long');
            onLoad();
            return true;
        } catch (err) {
            Alert.alert('Something went wrong!', 'Unable to delete Investment. ' + err.message);
            return false;
        }
    }

    const downloadAllInvestment = async () => {
        try {
            showToastMessage('Downloading Started...', 'bottom', 'short');
            let html = '';
            if (selectedCategory && selectedCategory !== 'All') {
                const body = generateHtmlForInvestmentCategory(allInvestments[selectedCategory].investmentList, getInvestmentSummary(selectedCategory), selectedCategory);
                html = generateHtmlTemplate('My Investment', body, month);
            } else {
                html = generateHtmlForAllInvestment(allInvestments, investmentSummary, month);
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

    return (
        <View>
            {!loading &&
                <OptionsBar
                    status={status}
                    setStatus={setStatus}
                    statusOptions={INVESTMENT_FILTERS}
                    filter={order}
                    setFilter={setOrder}
                    filters={INVESTMENT_SORT_OPTIONS}
                    onPressDownload={downloadAllInvestment}
                />
            }
            {loading || !allInvestments ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                selectedCategory === 'All' ?
                    renderAllInvestments() :
                    <InvestmentList
                        expenses={allInvestments[selectedCategory] ? allInvestments[selectedCategory].expenseList : []}
                        title={selectedCategory}
                        expenseCount={summary ? summary.count : 0}
                        expenseTotal={summary ? summary.totalAmount : 0}
                        month={month}
                        updateExpenseList={updateInvestmentList}
                        deleteExpense={deleteInvestment}
                    />
            }
        </View>
    )
}

export default Investments;