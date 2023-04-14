import React, { useState, useRef, useCallback } from "react";
import { View, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants';
import { processInvestmentDataToDisplay, showToastMessage } from '../../helpers';
import ChartGroup from "../ChartGroup";
import InvestmentSummary, { SummaryHeader } from './InvestmentSummary';
import OptionsBar from '../OptionsBar';
import ViewShot from 'react-native-view-shot';
import { shareAsync } from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { INVESTMENT_FILTERS } from "../../constants/data";

export default function InvestmentCharts({ fromDate, toDate, selectedCategory, setSelectedCategory, status, setStatus }) {

    const [chartData, setChartData] = useState([]);
    const [chartSummaryData, setChartSummaryData] = useState([]);
    const [colorScales, setColorScales] = useState([]);
    const [totalInvestment, setTotalInvestment] = useState({});
    const [totalReturn, setTotalReturn] = useState({});
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            processInvestmentDataToDisplay(status, fromDate.toISOString(), toDate.toISOString()).then(res => {
                setChartData(res.chartGroupData);
                setChartSummaryData(res.finalChartSummary);
                setColorScales(res.finalChartSummary.map((item) => item.color));
                setTotalInvestment(res.investmentSumDetail);
                setTotalReturn(res.returnSumDetail);
                setTotalRecords(res.investmentRecordsCount);
                setLoading(false);
            }).catch(err => {
                setLoading(false);
                Alert.alert('Something went wrong!', 'Error occured while calclating data.\n' + err.message);
            })
        }, [status, fromDate.toISOString(), toDate.toISOString()])
    )

    return (
        <InvestmentChartUI
            chartData={chartData}
            chartSummaryData={chartSummaryData}
            colorScales={colorScales}
            totalInvestment={totalInvestment}
            totalReturn={totalReturn}
            totalRecords={totalRecords}
            loading={loading}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            status={status}
            setStatus={setStatus}
        />
    )
}

export const InvestmentChartUI = ({ chartData, chartSummaryData, colorScales, totalInvestment, totalReturn, totalRecords, loading, selectedCategory, setSelectedCategory, status, setStatus, extraChartStyles }) => {
    const chartContainer = useRef();

    const downloadInvestmentAnalysis = async () => {
        showToastMessage('Downloading Started...', 'bottom', 'long');
        chartContainer.current.capture().then(uri => {
            console.log('File has been saved to:', uri);
            return shareAsync(uri, { UTI: '.png', mimeType: 'application/png' });
        }).then((res) => {
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
                        <SummaryHeader
                            status={status}
                            investmentDetails={totalInvestment}
                            returnDetails={totalReturn}
                        />

                        <ChartGroup
                            title='Inv-Ret'
                            selectedCategory={selectedCategory}
                            setSelectCategoryByName={setSelectedCategory}
                            chartData={chartData}
                            colorScales={colorScales}
                            extraText={`Overall you have Investmented in ${totalRecords} Schemes.`}
                            extraStyles={extraChartStyles}
                        />

                        <InvestmentSummary
                            data={chartSummaryData}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            status={status}
                        />
                    </>
                }
            </ViewShot>
        </View>
    );
}