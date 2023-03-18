import { useContext } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native'
import FormModal from '../Components/FormModal';
import ImagePicker from '../Components/imagePicker';
import { COLORS, FONTS, SIZES } from '../constants';
import { UserContext } from '../Context/user';
import { showToastMessage } from '../helpers';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { deleteAllExpenseData } from '../DB';

const UserInfoForm = () => {
  const { goBack } = useNavigation();
  const { userName, userImage, notification, setName, setImage, setNotification, saveUserData } = useContext(UserContext);

  const submit = async () => {
    if (!userName || !userImage) {
      return showToastMessage('Please fill all the Fields Correctly!', 'top');
    }
    const { err } = await saveUserData();
    if (err) throw new Error(err);
    goBack();
  }

  const deleteExpenseDataHandler = () => {
    Alert.alert('Delete All Your Expense Data?', 'Are you sure, you want delete your all expense data from this device?',
      [
        {
          text: "DELETE",
          style: "default",
          onPress: () => {
            deleteAllExpenseData().then(res => {
              showToastMessage('Expense Data Deleted Successfully!');
            }).catch(err => {
              showToastMessage('Failed to delete Expense data! ' + err.message);
            })
          }
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  }

  return (
    <FormModal title='Personal Information' submit={submit} successMsg='Information Saved Successfully.'>
      <Text style={styles.inputLable}>Your Good Name: </Text>
      <TextInput value={userName} keyboardType='default' placeholder='Name' style={styles.input} placeholderTextColor={COLORS.primary} onChangeText={(value) => setName(value)} />
      <Text style={styles.inputLable}>Choose your Pic: </Text>
      <ImagePicker setImage={setImage} image={userImage} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.base }}>
        <Text style={{ ...FONTS.h3, color: COLORS.primary }}>Notifications: </Text>
        <Picker selectedValue={notification} mode='dropdown'
          onValueChange={(itemValue) => setNotification(itemValue)}
          style={{ color: COLORS.primary, flex: 1, ...FONTS.body3 }}
          dropdownIconColor={COLORS.primary}>
          <Picker.Item key='1' label='EveryDay' value='EveryDay' />
          <Picker.Item key='2' label='MonthEnd' value='MonthEnd' />
          <Picker.Item key='3' label='Never' value='Never' />
        </Picker>
      </View>
      {notification === 'EveryDay' &&
        <Text style={{ ...FONTS.h4, color: COLORS.purple, }}>NOTE: In "EveryDay" notifications you atleast have to open App once in a day! </Text>
      }
      <View style={{ marginTop: 20 }}>
        <Button title='Delete All Expense Data' color={COLORS.danger} onPress={deleteExpenseDataHandler} />
      </View>
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

export default UserInfoForm