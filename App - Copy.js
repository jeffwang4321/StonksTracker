import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, KeyboardAvoidingView, Keyboard, TextInput, ScrollView, Linking, Alert, Picker } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Stock from './components/Stock';

import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/MaterialIcons';  // https://github.com/oblador/react-native-vector-icons  expo install --save react-native-vector-icons
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [stockName, setStockName] = useState("");
  const [stockPrice, setStockPrice] = useState(null);
  const [stockShares, setStockShares] = useState(null);
  const [buying, setBuying] = useState(true);
  const [date, setDate] = useState(new Date().toString().slice(4, 15));

  const [addStockModal, setAddStockModal] = useState(false);
  const [editStockModal, setEditStockModal] = useState(false);
  const [menuModal, setMenuModal] = useState(false);
  const [activityModal, setActivityModal] = useState(false);
  const [singleStockModal, setSingleStockModalModal] = useState(false);

  const [stockList, setStockList] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [editStockIndex, setEditStockIndex] = useState();
  

  const setDefaultStates = () => {
    setStockName("");
    setStockPrice(null);
    setStockShares(null);
    setBuying(true);
    setDate(new Date().toString().slice(4, 15));
  }

  // Clicked Add in the addStockModal
  const handleAddStock = () => {
    Keyboard.dismiss();
    let tempJson = {
      "stockName": stockName,
      "stockPrice": stockPrice,
      "stockShares": stockShares,
      "buying": buying,
      "date": date,
    }
    let stockListCopy = [...stockList, tempJson];

    // Sort by name
    stockListCopy.sort(function(a, b){
      if (a.stockName < b.stockName) {
        return -1;
      }
      if (a.stockName > b.stockName) {
        return 1;
      }
      return new Date(a.date) - new Date(b.date);
    });

    setStockList(stockListCopy);
    setDefaultStates();
    setAddStockModal(false);
  }

  // Clicked editStockModal
  const clickEditStock = (index) => {
    setStockName(stockList[index].stockName);
    setStockPrice(stockList[index].stockPrice);
    setStockShares(stockList[index].stockShares);
    setBuying(stockList[index].buying);
    setDate(stockList[index].date);
    
    setEditStockIndex(index);
    setEditStockModal(true);
  }

  // Modify Stock in editStockModal
  const handleModifyStock = () => {
    Keyboard.dismiss();
    let tempJson = {
      "stockName": stockName,
      "stockPrice": stockPrice,
      "stockShares": stockShares,
      "buying": buying,
      "date": date,
    }
    let stockListCopy = [...stockList, tempJson];
    stockListCopy.splice(editStockIndex, 1);

    // Sort by name
    stockListCopy.sort(function(a, b){
      if (a.stockName < b.stockName) {
        return -1;
      }
      if (a.stockName > b.stockName) {
        return 1;
      }
      return new Date(a.date) - new Date(b.date);
    });

    setStockList(stockListCopy);
    setDefaultStates();
    setEditStockModal(false);
  }

  // Select stock on LongPress (Edit or delete)
  const confirmStockLongPress = (index) => {  
    let status = "Buy";
    if(!buying){
      status = "Sell";
    }

    Alert.alert(
      stockList[index].stockName + " - " + status,
      stockList[index].date + "\n\n" + stockList[index].stockShares  + " x $" + stockList[index].stockPrice,
      [
        { text: "Edit", onPress: () => clickEditStock(index)},
        { text: "Cancel"},
        { text: "DELETE", onPress: () => handleDeleteStockSingle(index)}
      ]
    );
  }

  // Delete Stock on LongPress
  const handleDeleteStockSingle = (index) => {
    Keyboard.dismiss();
    let stockListCopy = [...stockList];
    stockListCopy.splice(index, 1);
    setStockList(stockListCopy);
  }

  // Delete Stock in editStockModal
  const handleDeleteStock = () => {
    Keyboard.dismiss();
    let stockListCopy = [...stockList];
    stockListCopy.splice(editStockIndex, 1);
    setStockList(stockListCopy);

    setDefaultStates();
    setEditStockIndex();
    setEditStockModal(false);
  }

  // Handle Date Picker and set Date
  const handleDateConfirm = (date) => {
    setDate(date.toString().slice(4, 15));
    setDatePickerVisibility(false);
  };

  useEffect(() =>{
    load();
  }, []);
  useEffect(() => {
    save();
  }, [stockList]);

  // Load stockArray values from AsyncStorage
  const load = async() => {
    try{
      let stockArray = await AsyncStorage.getItem("stockArray");
      if(stockArray !== null){
        setStockList(JSON.parse(stockArray));
      }
    }catch(err){
      alert(err);
    }
    
  }

  // Save stockArray values to AsyncStorage
  const save = async() => {
    try{
      await AsyncStorage.setItem("stockArray", JSON.stringify(stockList));
    }catch(err){
      alert(err);
    }
  }

  // Handle URL about click 
  const handleURLPress = async () => {
    let url = "https://jeffwang4321.github.io/";
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Can not open URL: " + url);
    }
  }

  const renderStockList = () => {
    let stockListCopy = [...stockList];
    let content = [];
    let tempStockList = [];
    let tempJson = {
      "stockName": "",
      "stockPrice": 0,
      "stockShares": 0,
    }

    for(let index = 0; index < stockListCopy.length; index++){

      if(index == 0){
        tempJson.stockName = stockListCopy[index].stockName;
        
        if(stockListCopy[index].buying){
          tempJson.stockPrice = tempJson.stockPrice + parseFloat(stockListCopy[index].stockPrice) * parseFloat(stockListCopy[index].stockShares);
          tempJson.stockShares = tempJson.stockShares + parseFloat(stockListCopy[index].stockShares);
        }else{
          tempJson.stockPrice = tempJson.stockPrice - parseFloat(stockListCopy[index].stockPrice);
          tempJson.stockShares = tempJson.stockShares - parseFloat(stockListCopy[index].stockShares) * parseFloat(stockListCopy[index].stockShares);
        }
      }
      else if(stockListCopy[index].stockName != tempJson.stockName){
        const newObject = {...tempJson};
        tempStockList.push(newObject);
        tempJson.stockName = stockListCopy[index].stockName;
        
        if(stockListCopy[index].buying){
          tempJson.stockPrice = 0 + parseFloat(stockListCopy[index].stockPrice) * parseFloat(stockListCopy[index].stockShares);
          tempJson.stockShares = 0 + parseFloat(stockListCopy[index].stockShares);
        }else{
          tempJson.stockPrice = 0 - parseFloat(stockListCopy[index].stockPrice);
          tempJson.stockShares = 0 - parseFloat(stockListCopy[index].stockShares) * parseFloat(stockListCopy[index].stockShares);
        }
      }
      else{
        if(stockListCopy[index].buying){
          tempJson.stockPrice = tempJson.stockPrice + parseFloat(stockListCopy[index].stockPrice) * parseFloat(stockListCopy[index].stockShares);
          tempJson.stockShares = tempJson.stockShares + parseFloat(stockListCopy[index].stockShares);
        }else{
          tempJson.stockPrice = tempJson.stockPrice - parseFloat(stockListCopy[index].stockPrice) * parseFloat(stockListCopy[index].stockShares);
          tempJson.stockShares = tempJson.stockShares - parseFloat(stockListCopy[index].stockShares);
        }
      }
    }
    
    if(stockListCopy.length > 0){
      const newObject = {...tempJson};
      tempStockList.push(newObject);
    }

    // Push all stocks from tempStockList above
    for(let index = 0; index < tempStockList.length; index++){
      content.push(
        <TouchableOpacity style={styles.item} key={index} onPress={() => setSingleStockModal(true)}>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>{tempStockList[index].stockName}</Text></Text>
            <Text style={[styles.itemText, {textAlign:'right', fontWeight: 'bold'}]}>{"$" + tempStockList[index].stockPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemText]}>{tempStockList[index].stockShares + " Shares"}</Text>
            <Text style={[styles.itemText, {textAlign:'right'}]}>{"Avg $" + (tempStockList[index].stockPrice / tempStockList[index].stockShares).toFixed(2)}</Text>
          </View>     
        </TouchableOpacity>
      );
    }


    // Pushing all stock activity below red line
    // content.push(<View key={"a"} style={{borderBottomColor: 'red', borderBottomWidth: 2,}}/>);
    // for(let index = 0; index < stockListCopy.length; index++){
    //   content.push(
    //     <TouchableOpacity key={index + "a"} onPress={() => clickEditStock(index)} onLongPress={() => confirmStockLongPress(index)}>
    //       <Stock text={stockListCopy[index]} index={index} /> 
    //     </TouchableOpacity>
    //   );
    // }

    return content;
  }

  const renderActivityList = () => {
    let stockListCopy = [...stockList];
    let content = [];

    for(let index = 0; index < stockListCopy.length; index++){
      content.push(
        <TouchableOpacity key={index + "a"} onPress={() => clickEditStock(index)} onLongPress={() => confirmStockLongPress(index)}>
          <Stock text={stockListCopy[index]} index={index} /> 
        </TouchableOpacity>
      );
    }

    return content;
  }


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps='handled'
      >
        {/* Today's Stock */}
        <View style={styles.tasksWrapper}>
          <View style={styles.sectionTitleWrapper}>
            <Text style={styles.sectionTitle}>StonksTracker</Text>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => setMenuModal(true)}>
              <Text><Icon style={styles.icon} name="menu"/></Text>
            </TouchableOpacity>
          </View>
          <View style={styles.items}>
            {
              renderStockList()
            }
          </View>
        </View>
        
      </ScrollView>

      <TouchableOpacity style={styles.addTaskWrapper} onPress={() => setAddStockModal(true)}>
        <Icon style={styles.icon} name="add-circle"/>
      </TouchableOpacity>


      {/* Add Stock Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        visible={addStockModal}
        onRequestClose={() => {setAddStockModal(false); setDefaultStates();}}
      >
        
        {/* Uses a keyboard avoiding view which ensures the keyboard does not cover the items on screen */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalContainer}
        >
        
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => {setAddStockModal(false); setDefaultStates();}}>
              <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Add Stonk</Text>
          </View>
          {/* Writing a Stock */}
          <TextInput style={styles.input} placeholder={'Stock Name'} value={stockName} onChangeText={setStockName} />
          <TextInput style={styles.input} placeholder={'Stock Price'} value={stockPrice} onChangeText={setStockPrice} keyboardType='numeric'/>
          <TextInput style={styles.input} placeholder={'Shares'} value={stockShares} onChangeText={setStockShares} keyboardType='numeric'/>

          <TouchableOpacity color="#f194ff" style={[styles.buttonStyle, {backgroundColor: "#FFF"}]} onPress={() => setDatePickerVisibility(true)}>
            <Text>{date.slice(0,-5) + "," + date.slice(-5)}</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />

          <View style={styles.picker}>
            <Picker selectedValue={buying} onValueChange={(itemValue) => setBuying(itemValue)}>
              <Picker.Item label="Buying" value={true} />
              <Picker.Item label="Selling" value={false} />
            </Picker>
          </View>

          <TouchableOpacity style={styles.addTaskWrapper} onPress={() => handleAddStock()}>
            <Icon style={styles.icon} name="save"/>
          </TouchableOpacity>
        
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        visible={editStockModal}
        onRequestClose={() => {setEditStockModal(false); setDefaultStates();}}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.modalContainer}
        > 
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => {setEditStockModal(false); setDefaultStates();}}>
              <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Edit Stonk</Text>
          </View>
          <TextInput style={styles.input} placeholder={'Stock Name'} value={stockName} onChangeText={setStockName} />
          <TextInput style={styles.input} placeholder={'Stock Price'} value={stockPrice} onChangeText={setStockPrice} keyboardType='numeric'/>
          <TextInput style={styles.input} placeholder={'Shares'} value={stockShares} onChangeText={setStockShares} keyboardType='numeric'/>

          <TouchableOpacity style={[styles.buttonStyle, {backgroundColor: "#FFF"}]} onPress={() => setDatePickerVisibility(true)}>
            <Text>{date.slice(0,-5) + "," + date.slice(-5)}</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={() => setDatePickerVisibility(false)}
          />

          <View style={styles.picker}>
            <Picker selectedValue={buying} onValueChange={(itemValue) => setBuying(itemValue)}>
              <Picker.Item label="Buying" value={true} />
              <Picker.Item label="Selling" value={false} />
            </Picker>
          </View>

          <TouchableOpacity style={styles.addTaskWrapper} onPress={() => handleModifyStock()}>
            <Icon style={styles.icon} name="save"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteTaskWrapper} onPress={() => handleDeleteStock()}>
            <Icon style={styles.icon} name="delete"/>
          </TouchableOpacity>
        </KeyboardAvoidingView>
          
      </Modal>

      
      {/* Menu Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        transparent={true}
        visible={menuModal}
        onRequestClose={() => setMenuModal(false)}
      >
        <View style={styles.modalBG}>
          <View style={styles.modalView}>
            <TouchableOpacity style={[styles.menuButton, {backgroundColor: "#ffb3ba"}]} onPress={() => {setActivityModal(true); setMenuModal(false);}}>
              <Text>Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, {backgroundColor: "#FFF"}]} onPress={() => handleURLPress()}>
              <Text>About</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setMenuModal(false)}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Activity Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={true}
        visible={activityModal}
        onRequestClose={() => setActivityModal(false)}
      > 
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps='handled'
        >
          {/* Stock Activity */}
          <View style={styles.tasksWrapper}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={styles.sectionTitleRight} onPress={() => setActivityModal(false)}>
                <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Activity</Text>
            </View>
            <View style={styles.items}>
              {
                renderActivityList()
              }
            </View>
          </View>
        </ScrollView>
        
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#FFF',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    // justifyContent: 'center',
    // backgroundColor: '#FFF',
  },
  tasksWrapper: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  addTaskWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    bottom: 40,
    right: 40,
    backgroundColor: '#FFF',
    borderRadius: 60,
    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteTaskWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    bottom: 40,
    right: 140,
    backgroundColor: '#FFF',
    borderRadius: 60,
    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 25,
    fontWeight: 'bold'
  },
  sectionSubtitle: {
    marginBottom: 5,
    fontWeight: 'bold'
  },
  items: {
    marginTop: 20,
  },
  icon: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  input: {
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    // width: '100%',
    color: '#000',
    // backgroundColor: '#FFF',
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#C0C0C0', 
  },
  buttonStyle: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 30,
    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalBG: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 30,
    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitleRight: {
    marginTop: 5,
  },
  menuButton: {
    marginTop: 13,
    marginBottom: 7,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: 170,
    borderRadius: 30,
    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  picker: {
    marginTop: 15,
    paddingVertical: 2,
    paddingHorizontal: 20,
    color: '#000',
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#C0C0C0', 
  },
  item: {
    paddingHorizontal: 3,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#C0C0C0', 
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemText:{
    flex: 1,
  },
});
