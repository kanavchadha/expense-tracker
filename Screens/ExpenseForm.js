import { useState, useEffect } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, View, Text, Switch, ActivityIndicator } from 'react-native';
import FormModal from '../Components/FormModal';
import { COLORS, FONTS, categoryOptions } from '../constants';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { getExpenseById, insertExpense, updateExpense } from '../DB';
import { showToastMessage } from '../helpers';
import { useNavigation, useRoute } from '@react-navigation/native';

const ExpenseForm = () => {
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('0');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(true);
  const [loading, setLoading] = useState(false);

  const { goBack, } = useNavigation();
  const { params } = useRoute();
  const { isEditMode, id, copy } = params;

  useEffect(() => {
    if (!isEditMode) return;
    setLoading(true);
    getExpenseById(id).then(res => {
      const exp = res.rows._array[0];
      if (!exp) throw new Error('Could not find data!');
      setCategory(exp.category);
      setAmount(exp.amount.toString());
      if (!copy) {
        setDate(new Date(exp.date.split(' ')[0]));
      } else {
        setDate(new Date());
      }
      setTitle(exp.title);
      setDescription(exp.description);
      setStatus(exp.status === 'true' ? true : false);
      setLoading(false);
    }).catch(err => {
      showToastMessage('Failed to edit this Expense!');
      console.log(err.message);
      setLoading(false);
    })
  }, []);

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      is24Hour: true,
      onChange: (event, value) => setDate(value)
    });
  }

  const descriptionChangeHandler = (value) => {
    if (value.length > 120) return;
    setDescription(value);
  }
  const titleChangeHandler = (value) => {
    if (value.length > 40) return;
    setTitle(value);
  }
  const categoryChangeHandler = (itemValue) => {
    // if (itemValue === 'Monthly Income') setStatus('income');
    setCategory(itemValue);
  }

  const submit = async () => {
    if (!title || !category || category === 'Category' || !amount || !date || !description) {
      showToastMessage('Please Fill all the Fields Correctly!', 'top');
      throw new Error('Please Fill all the Fields');
    }
    // date.setUTCHours(date.getHours(), date.getMinutes());
    if (isEditMode && !copy) {
      const res = await updateExpense(title, category, amount, date.toISOString(), description, status === true ? "true" : "false", id);
      if (res.rowsAffected !== 1) throw new Error('Error in Updating Data');
      goBack();
      return;
    }
    const res = await insertExpense(title, category, amount, date.toISOString(), description, status === true ? "true" : "false");
    if (res.rowsAffected !== 1) throw new Error('Error in Saving Data');
    goBack();
  }

  return (
    <FormModal title={!isEditMode || copy ? 'Add a Expense' : 'Update a Expense'} submit={submit} successMsg={`Expense ${isEditMode && !copy ? 'Updated' : 'Added'} Successfully.`} showErrAlert>
      {
        loading ? <ActivityIndicator size='large' color={COLORS.secondary} /> :
          <>
            <Text style={styles.inputLable}>Choose a Category :</Text>
            <View style={{ ...styles.input, marginBottom: 0 }}>
              <Picker
                selectedValue={category}
                mode='dropdown'
                style={{ color: COLORS.primary, marginVertical: -10 }}
                onValueChange={categoryChangeHandler}>
                {
                  categoryOptions.map(item => <Picker.Item key={item.id} label={item.value.toUpperCase()} value={item.value} />)
                }
              </Picker>
            </View>
            <Text style={styles.inputLable}>Expense Title ({title.length}/40): </Text>
            <TextInput value={title} keyboardType='default' placeholder='Title' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={titleChangeHandler} />
            <Text style={styles.inputLable}>Expense Description ({description.length}/120): </Text>
            <TextInput value={description} keyboardType='default' placeholder='Little Description' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={descriptionChangeHandler} multiline numberOfLines={3} />
            <Text style={styles.inputLable}>Expense Amount/Value: </Text>
            <TextInput value={amount} keyboardType='number-pad' placeholder='Amount' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => setAmount(value)} />
            <Text style={styles.inputLable}>Choose Expense Date: </Text>
            <TouchableOpacity onPress={openDatePicker} activeOpacity={1} style={{ marginTop: 5 }}>
              <View style={styles.input}>
                <Text style={{ fontSize: FONTS.body3.fontSize, fontFamily: FONTS.body3.fontFamily, color: COLORS.primary, }}>
                  {date.toDateString()}
                </Text>
              </View>
            </TouchableOpacity>
            {/* {category !== 'Monthly Income' && <> */}
            <Text style={styles.inputLable}>Expense Status: </Text>
            <View style={{ justifyContent: 'space-around', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: FONTS.body3.fontSize, fontFamily: FONTS.body3.fontFamily, color: COLORS.primary }}>Paid? :</Text>
              <Switch value={status} onValueChange={(value) => setStatus(value)} thumbColor={status ? COLORS.secondary : COLORS.lightBlue} trackColor={{ false: "#767577", true: COLORS.primary }} />
            </View>
            {/* </> } */}
          </>
      }
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

export default ExpenseForm;