import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native'
import { SummaryModal } from '../SummaryModal';
import { COLORS, SIZES } from '../../constants';
import { InvestmentChartUI } from './InvestmentCharts';
import { processInvestmentDataToDisplay } from '../../helpers';

const InvestmentOverallSummaryModal = ({ modalVisible, setModalVisible, selectedCategory, setSelectedCategory, filter, setFilter }) => {
    const [chartData, setChartData] = useState([]);
    const [chartSummaryData, setChartSummaryData] = useState([]);
    const [colorScales, setColorScales] = useState([]);
    const [totalInvestment, setTotalInvestment] = useState({});
    const [totalReturn, setTotalReturn] = useState({});
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        processInvestmentDataToDisplay(filter, null, null, true).then(res => {
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
    }, [filter])

    return (
        <SummaryModal modalVisible={modalVisible} setModalVisible={setModalVisible} title='Overall Investments'>
            {
                loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
                    <ScrollView>
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
                            status={filter}
                            setStatus={setFilter}
                            extraChartStyles={{width: SIZES.width/1.125}}
                        />
                    </ScrollView>

            }
        </SummaryModal>
    )
}

export default InvestmentOverallSummaryModal;