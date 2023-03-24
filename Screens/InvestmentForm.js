import { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, View, Text, Switch } from 'react-native';
import FormModal from '../Components/FormModal';
import { COLORS, FONTS, investmentCategoryOptions } from '../constants';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getInvestmentById, insertInvestment, updateInvestment } from '../DB';
import { showToastMessage } from '../helpers';
import { useNavigation, useRoute } from '@react-navigation/native';

const InvestmentForm = () => {
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('0');
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [interest, setInterest] = useState('');
  const [timePeriod, setTimePeriod] = useState('');

  const { goBack, } = useNavigation();
  const { params } = useRoute();
  const { isEditMode, id, copy } = params;

  useEffect(() => {
    if (!isEditMode) return;
    getInvestmentById(id).then(res => {
      const investment = res.rows._array[0];
      if (!investment) throw new Error('Could not find data!');
      setCategory(investment.category);
      setAmount(investment.amount.toString());
      if(!copy){
        setDate(new Date(investment.startDate.split(' ')[0]));
      }else{
        setDate(new Date());
      }
      setTitle(investment.title);
      setReference(investment.reference);
      setInterest(investment.interest);
      setTimePeriod(investment.timePeriod);
    }).catch(err => {
      showToastMessage('Failed to edit this Investment!');
      console.log(err.message);
    })
  }, []);

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      is24Hour: true,
      onChange: (event, value) => setDate(value)
    });
  }

  const referenceChangeHandler = (value) => {
    if (value.length > 120) return;
    setReference(value);
  }
  const titleChangeHandler = (value) => {
    if (value.length > 40) return;
    setTitle(value);
  }
  const categoryChangeHandler = (itemValue) => {
    setCategory(itemValue);
  }

  const submit = async () => {
    if (!title || !category || category === 'Category' || !amount || !date || !interest || !timePeriod) {
      return showToastMessage('Please Fill all the Fields Correctly!', 'top');
    }
    // date.setUTCHours(date.getHours(), date.getMinutes());
    if (isEditMode && !copy) {
      const res = await updateInvestment(title, category, amount, date.toISOString(), reference, timePeriod, interest, id);
      if (res.rowsAffected !== 1) throw new Error('Error in Updating Data');
      goBack();
      return;
    }
    const res = await insertInvestment(title, category, amount, date.toISOString(), reference, timePeriod, interest);
    if (res.rowsAffected !== 1) throw new Error('Error in Saving Data');
    goBack();
  }

  return (
    <FormModal title={!isEditMode || copy ? 'Add Investment' : 'Update Investment'} submit={submit} successMsg={`Investment ${isEditMode && !copy ? 'Updated' : 'Added'} Successfully.`} showErrAlert>
      <Text style={styles.inputLable}>Choose a Category : </Text>
      <View style={{ ...styles.input, marginBottom: 0 }}>
        <Picker
          selectedValue={category}
          mode='dropdown'
          style={{ color: COLORS.primary, marginVertical: -10 }}
          onValueChange={categoryChangeHandler}>
          {
            investmentCategoryOptions.map(item => <Picker.Item key={item.id} label={item.value.toUpperCase()} value={item.value} />)
          }
        </Picker>
      </View>
      <Text style={styles.inputLable}>Investment Title ({title.length}/40): </Text>
      <TextInput value={title} keyboardType='default' placeholder='Title' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={titleChangeHandler} />
      <Text style={styles.inputLable}> Investment Reference (optional) ({reference.length}/120): </Text>
      <TextInput value={reference} keyboardType='default' placeholder='Little Reference' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={referenceChangeHandler} multiline numberOfLines={3} />
      <Text style={styles.inputLable}>Investment Amount/Value: </Text>
      <TextInput value={amount} keyboardType='number-pad' placeholder='Amount' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => setAmount(value)} />
      <Text style={styles.inputLable}>Choose Investment Start Date: </Text>
      <TouchableOpacity onPress={openDatePicker} activeOpacity={1} style={{ marginTop: 5 }}>
        <View style={styles.input}>
          <Text style={{ fontSize: FONTS.body3.fontSize, fontFamily: FONTS.body3.fontFamily, color: COLORS.primary, }}>
            {date.toDateString()}
          </Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.inputLable}>Investment Interest/Return Rate (in %): </Text>
      <TextInput value={interest} keyboardType='number-pad' placeholder='Interest/Return Rate' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => setInterest(value)} />
      <Text style={styles.inputLable}>Investment Time Period (in years): </Text>
      <TextInput value={timePeriod} keyboardType='number-pad' placeholder='Time Period' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => setTimePeriod(value)} />
    </FormModal>
  )
}

const styles = StyleSheet.create({
  input: {
    borderBottomColor: COLORS.secondary,
    color: COLORS.primary,
    borderBottomWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 3,
    marginVertical: 3,
    width: '100%',
    fontSize: FONTS.body3.fontSize,
    fontFamily: FONTS.body3.fontFamily
  },
  inputLable: {
    color: COLORS.primary,
    paddingHorizontal: 3,
    marginTop: 20,
    fontSize: FONTS.h3.fontSize,
    fontFamily: FONTS.h3.fontFamily
  }
})

export default InvestmentForm;