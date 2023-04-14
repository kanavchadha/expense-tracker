import React, { useState, useCallback, useMemo } from "react";
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import InvestmentList from './InvestmentList';
import OptionsBar from "../OptionsBar";
import { getInvestmentsCategoryGrouped, removeInvestment } from "../../DB";
import { generateHtmlTemplate, showToastMessage } from "../../helpers";
import { INVESTMENT_FILTERS, INVESTMENT_SORT_OPTIONS } from "../../constants/data";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, FONTS } from "../../constants";
import InvestmentDetailsModal from "./InvestmentDetails";

const Investments = ({ fromDate, toDate, selectedCategory, status, setStatus }) => {
    const [allInvestments, setAllInvestments] = useState({});
    const [investmentSummary, setInvestmentSummary] = useState([]);
    const [order, setOrder] = useState('id DESC');
    const [selectedInvestmentId, setSelectedInvestmentId] = useState(false);
    const [loading, setLoading] = useState(false);

    const onLoad = async () => {
        setLoading(true);
        getInvestmentsCategoryGrouped(fromDate.toISOString(), toDate.toISOString(), status, order).then(res => {
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
        }, [status, order, fromDate.toISOString(), toDate.toISOString()])
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
                investments={allInvestments[category].investmentList}
                title={category}
                investmentCount={catSummary ? catSummary.count : 0}
                totalInvested={catSummary ? catSummary.totalInvested : 0}
                totalReturns={catSummary ? catSummary.totalReturns : 0}
                fromDate={fromDate}
                toDate={toDate}
                status={status}
                order={order}
                updateInvestmentList={updateInvestmentList}
                deleteInvestment={deleteInvestment}
                showInvestmentDetails={showInvestmentDetails}
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
            if (!res.investment || !res.expense) throw new Error('Error in Deleting Data');
            showToastMessage('Investment deleted successfully', 'bottom', 'long');
            onLoad();
            return true;
        } catch (err) {
            Alert.alert('Something went wrong!', 'Unable to delete Investment. ' + err.message);
            return false;
        }
    }

    const showInvestmentDetails = (id)=>{
        setSelectedInvestmentId(id);
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

    const summary = useMemo(()=>getInvestmentSummary(selectedCategory), [selectedCategory]);

    return (
        <>
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
                        investments={allInvestments[selectedCategory] ? allInvestments[selectedCategory].investmentList : []}
                        title={selectedCategory}
                        investmentCount={summary ? summary.count : 0}
                        totalInvested={summary ? summary.totalInvested : 0}
                        totalReturns={summary ? summary.totalReturns : 0}
                        fromDate={fromDate}
                        toDate={toDate}
                        status={status}
                        order={order}
                        updateInvestmentList={updateInvestmentList}
                        deleteInvestment={deleteInvestment}
                        showInvestmentDetails={showInvestmentDetails}
                    />
            }
        </View>
        <InvestmentDetailsModal id={selectedInvestmentId} setShowDetails={setSelectedInvestmentId} />
        </>
    )
}

export default Investments;