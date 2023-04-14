import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants';
import { processCategoryDataToDisplay, showToastMessage } from '../helpers';
import ExpenseSummary from './ExpenseSummary';
import Chart from "./Chart";
import OptionsBar from './OptionsBar';
import SummaryHeader from "./SummaryHeader";
import ViewShot from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';

export default function ExpenseCharts({ selectedCategory, setSelectedCategory, month, setMonth }) {

    const [chartData, setChartData] = useState([]);
    const [colorScales, setColorScales] = useState([]);
    const [totalExpenditure, setTotalExpenditure] = useState({});
    const [status, setStatus] = useState('true');
    const [loading, setLoading] = useState(false);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const chartContainer = useRef();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            processCategoryDataToDisplay(status, month).then(res => {
                setChartData(res.finalChartData);
                setColorScales(res.finalChartData.map((item) => item.color));
                setTotalExpenditure({ total: res.totalExpense, count: res.expenseCount, details: res.expSumDetail });
                setMonthlyIncome(res.income);
                setLoading(false);
            }).catch(err => {
                setLoading(false);
                Alert.alert('Something went wrong!', 'Error occured while calclating data.\n' + err.message);
            })
        }, [status, month])
    )

    const downloadExpenseAnalysis = async () => {
        showToastMessage('Downloading Started...', 'bottom', 'long');
        chartContainer.current.capture().then(uri => {
            console.log('File has been saved to:', uri);
            showToastMessage('Downloading Completed...', 'bottom', 'long');
            return shareAsync(uri, { UTI: '.png', mimeType: 'application/png' });
        }).then((res)=>{
            showToastMessage('Downloading Completed...', 'bottom', 'long');
        }).catch(err => {
            showToastMessage('Download Failed...', 'bottom', 'long');
            Alert.alert('Something went wrong!', err.message);
        })
    }

    return (
        <View>
            {!loading && <OptionsBar status={status} setStatus={setStatus} onPressDownload={downloadExpenseAnalysis} month={month} setMonth={setMonth} />}
            <ViewShot ref={chartContainer} options={{ format: "png" }}>
                {loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                    <>
                        <SummaryHeader monthlyIncome={monthlyIncome} status={status} totalExpenditure={totalExpenditure.total} summaryDetails={totalExpenditure.details} />
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Chart title='Expenses' selectedCategory={selectedCategory} setSelectCategoryByName={setSelectedCategory} chartData={chartData} colorScales={colorScales} totalCount={totalExpenditure.count} extraTitleStyles={{}} />
                        </View>
                        <ExpenseSummary data={chartData} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} status={status} totalExpenditure={totalExpenditure.details?.paidExpenseTotal} totalIncome={monthlyIncome?.paidAmount} />
                    </>
                }
            </ViewShot>
        </View>
    )
}