import React, { useState, useRef, useCallback } from "react";
import { View, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants';
import { processCategoryDataToDisplay, showToastMessage } from '../../helpers';
import InvestmentSummary from './InvestmentSummary';
import Chart from "../Chart";
import OptionsBar from '../OptionsBar';
import ViewShot from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { INVESTMENT_FILTERS } from "../../constants/data";

export default function InvestmentCharts({ fromDate, toDate, selectedCategory, setSelectedCategory, status, setStatus }) {

    const [chartData, setChartData] = useState([]);
    const [colorScales, setColorScales] = useState([]);
    const [totalInvestment, setTotalInvestment] = useState({});
    const [totalReturns, setTotalReturns] = useState();
    const [loading, setLoading] = useState(false);
    const chartContainer = useRef();

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            processCategoryDataToDisplay(status, month).then(res => {
                setChartData(res.finalChartData);
                setColorScales(res.finalChartData.map((item) => item.color));
                setTotalInvestment({ total: res.totalExpense, count: res.expenseCount, details: res.expSumDetail });
                setTotalReturns(res.income);
                setLoading(false);
            }).catch(err => {
                setLoading(false);
                Alert.alert('Something went wrong!', 'Error occured while calclating data.\n' + err.message);
            })
        }, [status, fromDate.toISOString(), toDate.toISOString()])
    )

    const downloadInvestmentAnalysis = async () => {
        showToastMessage('Downloading Started...', 'bottom', 'long');
        chartContainer.current.capture().then(uri => {
            console.log('File has been saved to:', uri);
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
            {!loading &&
                <OptionsBar
                    status={status}
                    setStatus={setStatus}
                    statusOptions={INVESTMENT_FILTERS}
                    onPressDownload={downloadInvestmentAnalysis}
                />
            }
            <ViewShot ref={chartContainer} options={{ format: "png" }}>
                {loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                    <>
                        {/* <SummaryHeader monthlyIncome={monthlyIncome} status={status} totalInvestment={totalInvestment.total} summaryDetails={totalInvestment.details} /> */}
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Chart title='Investments' selectedCategory={selectedCategory} setSelectCategoryByName={setSelectedCategory} chartData={chartData} colorScales={colorScales} totalCount={totalInvestment.count} />
                        </View>
                        <InvestmentSummary data={chartData} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} status={status} totalInvestment={totalInvestment.details?.paidExpenseTotal} totalReturns={totalInvestment.details?.paidExpenseTotal} />
                    </>
                }
            </ViewShot>
        </View>
    )
}