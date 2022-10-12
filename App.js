// TODO: Functionality - home page -> longpress to delete all instances of the stock
// TODO: Clean up code and componentize

import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, KeyboardAvoidingView, Keyboard, TextInput, ScrollView, Linking, Alert, Picker } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Stock from './components/Stock';
import Price from './components/Price';

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
  const [singleStockModal, setSingleStockModal] = useState(false);
  const [priceModal, setPriceModal] = useState(false);
  
  const [stockList, setStockList] = useState([]);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [editStockIndex, setEditStockIndex] = useState();

  const [singleStockName, setSingleStockName] = useState("");
  const [singleStockPrice, setSingleStockPrice] = useState(0);
  const [singleStockShares, setSingleStockShares] = useState(0);

  const [priceName, setPriceName] = useState("");
  const [pricePrice, setPricePrice] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [editPriceIndex, setEditPriceIndex] = useState();

  const [addPriceModal, setAddPriceModal] = useState(false);
  const [editPriceModal, setEditPriceModal] = useState(false);
  const versionNumber = "V1.1";

  
  //Set Stonk values to default states 
  const setDefaultStates = () => {
    setStockName("");
    setStockPrice(null);
    setStockShares(null);
    setBuying(true);
    setDate(new Date().toString().slice(4, 15));
  }

  //Set Price values to default states 
  const setDefaultPriceStates = () => {
    setPriceName("");
    setPricePrice(null);
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
      return new Date(b.date)- new Date(a.date);
    });

    setStockList(stockListCopy);
    setDefaultStates();
    setAddStockModal(false);
  }

  // Clicked Add in the addPriceModal
  const handleAddPrice = () => {
    Keyboard.dismiss();
    let tempJson = {
      "priceName": priceName,
      "pricePrice": pricePrice,
    }
    let priceListCopy = [...priceList, tempJson];

    // Sort by name
    priceListCopy.sort(function(a, b){
      if (a.priceName < b.priceName) {
        return -1;
      }
      if (a.priceName > b.priceName) {
        return 1;
      }
      return 0;
    });

    setPriceList(priceListCopy);
    setDefaultPriceStates();
    setAddPriceModal(false);
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

  // Clicked editPriceModal
  const clickEditPrice = (index) => {
    setPriceName(priceList[index].priceName);
    setPricePrice(priceList[index].pricePrice);
    
    setEditPriceIndex(index);
    setEditPriceModal(true);
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
      return new Date(b.date) - new Date(a.date);
    });

    setStockList(stockListCopy);
    setDefaultStates();
    setEditStockModal(false);
  }

  // Modify Price in editPriceModal
  const handleModifyPrice = () => {
    Keyboard.dismiss();
    let tempJson = {
      "priceName": priceName,
      "pricePrice": pricePrice,
    }
    let priceListCopy = [...priceList, tempJson];
    priceListCopy.splice(editPriceIndex, 1);

    // Sort by name
    priceListCopy.sort(function(a, b){
      if (a.priceName < b.priceName) {
        return -1;
      }
      if (a.priceName > b.priceName) {
        return 1;
      }
      return 0;
    });

    setPriceList(priceListCopy);
    setDefaultPriceStates();
    setEditPriceModal(false);
  }

  // Select Stock on LongPress (Edit or delete)
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

   // Select Price on LongPress (Edit or delete)
   const confirmPriceLongPress = (index) => {  

    Alert.alert(
      priceList[index].priceName,
      "$" + priceList[index].pricePrice,
      [
        { text: "Edit", onPress: () => clickEditPrice(index)},
        { text: "Cancel"},
        { text: "DELETE", onPress: () => handleDeletePriceSingle(index)}
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

  // Delete Price on LongPress
  const handleDeletePriceSingle = (index) => {
    Keyboard.dismiss();
    let priceListCopy = [...priceList];
    priceListCopy.splice(index, 1);
    setPriceList(priceListCopy);
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

  // Delete Price in editPriceModal
  const handleDeletePrice = () => {
    Keyboard.dismiss();
    let priceListCopy = [...priceList];
    priceListCopy.splice(editPriceIndex, 1);
    setPriceList(priceListCopy);

    setDefaultPriceStates();
    setEditPriceIndex();
    setEditPriceModal(false);
  }

  // Handle Date Picker and set Date
  const handleDateConfirm = (date) => {
    setDate(date.toString().slice(4, 15));
    setDatePickerVisibility(false);
  };

  // Hooks for state manipulation, get and fetch JSON from AsyncStorage
  useEffect(() =>{
    load();
    load2();
  }, []);
  useEffect(() => {
    save();
  }, [stockList]);

  useEffect(() => {
    save2();
  }, [priceList]);
  
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

  // Load priceArray values from AsyncStorage
  const load2 = async() => {
    try{
      let priceArray = await AsyncStorage.getItem("priceArray");
      if(priceArray !== null){
        setPriceList(JSON.parse(priceArray));
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

  // Save priceArray values to AsyncStorage
  const save2 = async() => {
    try{
      await AsyncStorage.setItem("priceArray", JSON.stringify(priceList));
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

  // get the listed price of the single stock
  const getSinglePrice = (name) => {
    for(let index = 0; index < priceList.length; index++){
      if(priceList[index].priceName == name){
        return priceList[index].pricePrice;
      }
    }
    return 0;
  }


  // Render the list of unique Stocks and aggregate data 
  const renderStockList = () => {
    let content = [];
    let tempStockList = [];
    let tempJson = {
      "stockName": "",
      "stockPrice": 0,
      "stockShares": 0,
    }

    // Iterate through all stock activity, generate a list of unique Stock name, aggregate the stock prices & shares data
    for(let index = 0; index < stockList.length; index++){
      if(index == 0){
        tempJson.stockName = stockList[index].stockName;
        
        if(stockList[index].buying){
          tempJson.stockPrice = tempJson.stockPrice + parseFloat(stockList[index].stockPrice) * parseFloat(stockList[index].stockShares);
          tempJson.stockShares = tempJson.stockShares + parseFloat(stockList[index].stockShares);
        }else{
          tempJson.stockPrice = tempJson.stockPrice - parseFloat(stockList[index].stockPrice);
          tempJson.stockShares = tempJson.stockShares - parseFloat(stockList[index].stockShares) * parseFloat(stockList[index].stockShares);
        }
      }
      else if(stockList[index].stockName != tempJson.stockName){
        const newObject = {...tempJson};
        tempStockList.push(newObject);
        tempJson.stockName = stockList[index].stockName;
        
        if(stockList[index].buying){
          tempJson.stockPrice = 0 + parseFloat(stockList[index].stockPrice) * parseFloat(stockList[index].stockShares);
          tempJson.stockShares = 0 + parseFloat(stockList[index].stockShares);
        }else{
          tempJson.stockPrice = 0 - parseFloat(stockList[index].stockPrice);
          tempJson.stockShares = 0 - parseFloat(stockList[index].stockShares) * parseFloat(stockList[index].stockShares);
        }
      }
      else{
        if(stockList[index].buying){
          tempJson.stockPrice = tempJson.stockPrice + parseFloat(stockList[index].stockPrice) * parseFloat(stockList[index].stockShares);
          tempJson.stockShares = tempJson.stockShares + parseFloat(stockList[index].stockShares);
        }else{
          tempJson.stockPrice = tempJson.stockPrice - parseFloat(stockList[index].stockPrice) * parseFloat(stockList[index].stockShares);
          tempJson.stockShares = tempJson.stockShares - parseFloat(stockList[index].stockShares);
        }
      }
    }
    
    if(stockList.length > 0){
      const newObject = {...tempJson};
      tempStockList.push(newObject);
    }


    // Push all unique stocks from tempStockList into our return content
    for(let index = 0; index < tempStockList.length; index++){
      content.push(
        <TouchableOpacity style={styles.item} key={index} onPress={() => { setSingleStockModal(true), setSingleStockName(tempStockList[index].stockName), 
          setSingleStockPrice(tempStockList[index].stockPrice), setSingleStockShares(tempStockList[index].stockShares)
        }}>
          <View style={styles.itemRow}>
            <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>{tempStockList[index].stockName}</Text></Text>
            <Text style={[styles.itemText, {textAlign:'right', fontWeight: 'bold'}]}>{"$" + tempStockList[index].stockPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={[styles.itemText]}>{parseFloat(tempStockList[index].stockShares.toFixed(6)) + " Shares"}</Text>
            <Text style={[styles.itemText, {textAlign:'right'}]}>{"Avg $" + (tempStockList[index].stockPrice / tempStockList[index].stockShares).toFixed(2)}</Text>
          </View>     
        </TouchableOpacity>
      );
    }

    return content;
  }

  // Render the full list of All Stock Activities, adding empty row after grouping stocks
  const renderActivityList = () => {
    let content = [];
    let tempName = "";

    for(let index = 0; index < stockList.length; index++){
      if(index == 0){
        tempName = stockList[index].stockName;
      }else if( tempName != stockList[index].stockName){
        tempName = stockList[index].stockName;
        content.push(<Text key={index + "t"}/>);
      }
      content.push(
        <TouchableOpacity key={index} onPress={() => clickEditStock(index)} onLongPress={() => confirmStockLongPress(index)}>
          <Stock text={stockList[index]} index={index} /> 
        </TouchableOpacity>
      );
    }

    return content;
  }

  // Render the list of the Single Stock Activities
  const renderSingleStock = (name) => {
    let content = [];

    for(let index = 0; index < stockList.length; index++){
      if(name == stockList[index].stockName){
        content.push(
          <TouchableOpacity key={index} onPress={() => clickEditStock(index)} onLongPress={() => confirmStockLongPress(index)}>
            <Stock text={stockList[index]} index={index} /> 
          </TouchableOpacity>
        );
      }
    }

    return content;
  }

  // Render the full list of the Current Prices
  const renderPriceList = () => {
    let content = [];

    for(let index = 0; index < priceList.length; index++){
      content.push(
        <TouchableOpacity key={index} onPress={() => clickEditPrice(index)} onLongPress={() => {confirmPriceLongPress(index)}}>
          <Price text={priceList[index]} index={index} /> 
        </TouchableOpacity>
      );
    }

    return content;
  }

  return (
    <View style={styles.container}>
      <StatusBar  hidden = {false} translucent = {false} backgroundColor="#0d3b7c" style="light"/>
      
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
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
        <Text style={{textAlign:'center', paddingTop: 30, paddingBottom: 50, fontSize: 10}}>{versionNumber}</Text>
      </ScrollView>

      <TouchableOpacity style={styles.addTaskWrapper} onPress={() => setAddStockModal(true)}>
        <Icon style={styles.icon} name="add-circle"/>
      </TouchableOpacity>


      {/* Add Stock Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={false}
        visible={addStockModal}
        onRequestClose={() => {setAddStockModal(false); setDefaultStates();}}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
        
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => {setAddStockModal(false); setDefaultStates();}}>
              <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Add Stonk</Text>
          </View>

          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Stock</Text>
          <TextInput style={styles.input} autoCapitalize = {"characters"} value={stockName} onChangeText={setStockName} />
          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Price</Text>
          <TextInput style={styles.input} value={stockPrice} onChangeText={setStockPrice} keyboardType='numeric'/>
          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Shares</Text>
          <TextInput style={styles.input} value={stockShares} onChangeText={setStockShares} keyboardType='numeric'/>
          
          <TouchableOpacity color="#f194ff" style={[styles.dateButton, {backgroundColor: "#FFF"}]} onPress={() => setDatePickerVisibility(true)}>
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
        statusBarTranslucent={false}
        visible={editStockModal}
        onRequestClose={() => {setEditStockModal(false); setDefaultStates();}}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}> 

          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => {setEditStockModal(false); setDefaultStates();}}>
              <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Edit Stonk</Text>
          </View>

          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Stock</Text>
          <TextInput style={styles.input} autoCapitalize = {"characters"} value={stockName} onChangeText={setStockName} />
          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Price</Text>
          <TextInput style={styles.input} value={stockPrice} onChangeText={setStockPrice} keyboardType='numeric'/>
          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Shares</Text>
          <TextInput style={styles.input} value={stockShares} onChangeText={setStockShares} keyboardType='numeric'/>

          <TouchableOpacity style={[styles.dateButton, {backgroundColor: "#FFF"}]} onPress={() => setDatePickerVisibility(true)}>
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
        statusBarTranslucent={false}
        transparent={true}
        visible={menuModal}
        onRequestClose={() => setMenuModal(false)}
      >
        <View style={styles.modalBG}>

          <View style={styles.modalView}>
            <TouchableOpacity style={[styles.menuButton, {backgroundColor: "#0d3b7c"}]} onPress={() => {setPriceModal(true); setMenuModal(false);}}>
              <Text style={{color: 'white'}}>Set Pricies</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, {backgroundColor: "#0d3b7c"}]} onPress={() => {setActivityModal(true); setMenuModal(false);}}>
              <Text style={{color: 'white'}}>Activity</Text>
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
        statusBarTranslucent={false}
        visible={activityModal}
        onRequestClose={() => setActivityModal(false)}
      > 
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>

          <View style={styles.tasksWrapper}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={styles.sectionTitleRight} onPress={() => setActivityModal(false)}>
                <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>All Activity</Text>
            </View>

            <View style={styles.items}>
              {
                renderActivityList()
              }
            </View>
          </View>

          <Text style={{textAlign:'center', paddingTop: 30, paddingBottom: 50, fontSize: 10}}>{versionNumber}</Text>
        </ScrollView>
      </Modal>

      
      {/* Single Stock Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={false}
        visible={singleStockModal}
        onRequestClose={() => setSingleStockModal(false)}
      > 
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>

          <View style={styles.tasksWrapper}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={styles.sectionTitleRight} onPress={() => setSingleStockModal(false)}>
                <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>{singleStockName}</Text>

              <View style={{marginLeft: 'auto', flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => {setPriceModal(true);}}>
                  <Text style={{textAlign:'right', color:'#0d3b7c'}}><Text style={{fontWeight:'bold', fontSize: 12}}>Current Price{"\n"}</Text><Icon name="edit"/>  ${getSinglePrice(singleStockName)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text/>
            <Text style={{fontWeight:'bold', fontSize: 18}}>Holding</Text>
            <View style={[styles.itemRow, {borderBottomWidth: 1, borderColor: '#C0C0C0', paddingVertical: 10}]}>
              <Text style={[styles.itemText]}><Text style={{fontWeight:'bold', fontSize: 12}}>{"Shares \n"}</Text><Text style={{fontSize: 17}}>{parseFloat(singleStockShares.toFixed(6))}</Text></Text>
              <Text style={[styles.itemText, {textAlign:'right'}]}><Text style={{fontWeight:'bold', fontSize: 12}}>Total Value{"\n"}</Text>
                <Text style={{fontSize: 17}}>${(getSinglePrice(singleStockName) * singleStockShares).toFixed(2)}</Text></Text>
            </View>  
            <View style={[styles.itemRow, {borderBottomWidth: 1, borderColor: '#C0C0C0', paddingVertical: 10}]}>
              <Text style={[styles.itemText]}><Text style={{fontWeight:'bold', fontSize: 12}}>Average Price{"\n"}</Text><Text style={{fontSize: 17}}>${(singleStockPrice / singleStockShares).toFixed(2)}</Text></Text>
              <Text style={[styles.itemText, {textAlign:'right'}]}><Text style={{fontWeight:'bold', fontSize: 12}}>Total Return{"\n"}</Text>
                <Text style={{fontSize: 17}}>${(getSinglePrice(singleStockName) * singleStockShares - singleStockPrice).toFixed(2)}</Text></Text>
            </View> 
            <View style={[styles.itemRow, {paddingVertical: 10}]}>
              <Text style={[styles.itemText]}><Text style={{fontWeight:'bold', fontSize: 12}}>Total Cost{"\n"}</Text><Text style={{fontSize: 17}}>${singleStockPrice.toFixed(2)}</Text></Text>
              <Text style={[styles.itemText, {textAlign:'right'}]}><Text style={{fontWeight:'bold', fontSize: 12}}>Percentage Return{"\n"}</Text>
                <Text style={{fontSize: 17}}>{(((getSinglePrice(singleStockName) * singleStockShares - singleStockPrice) / singleStockPrice) * 100).toFixed(2)}%</Text></Text>
            </View> 
          
            
            <View style={styles.items}>
            <Text style={{fontWeight:'bold', fontSize: 18}}>Activity</Text>
              {
                renderSingleStock(singleStockName)
              }
            </View>
          </View>

          <Text style={{textAlign:'center', paddingTop: 30, paddingBottom: 50, fontSize: 10}}>{versionNumber}</Text>
        </ScrollView>
      </Modal>


      {/* Set Price Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={false}
        visible={priceModal}
        onRequestClose={() => setPriceModal(false)}
      > 
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>

          <View style={styles.tasksWrapper}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={styles.sectionTitleRight} onPress={() => setPriceModal(false)}>
                <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Current Prices</Text>
            </View>

            <View style={styles.items}>
              {
                renderPriceList()
              }
            </View>
          </View>

          <Text style={{textAlign:'center', paddingTop: 30, paddingBottom: 50, fontSize: 10}}>{versionNumber}</Text>
        </ScrollView>

        <TouchableOpacity style={styles.addTaskWrapper} onPress={() => setAddPriceModal(true)}>
          <Icon style={styles.icon} name="add-circle"/>
        </TouchableOpacity> 
      </Modal>


      {/* Add Price Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={false}
        visible={addPriceModal}
        onRequestClose={() => {setAddPriceModal(false); setDefaultPriceStates();}}
      >
        
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}> 
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => {setAddPriceModal(false); setDefaultPriceStates();}}>
              <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Add Price</Text>
          </View>

          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Stock</Text>
          <TextInput style={styles.input} autoCapitalize = {"characters"} value={priceName} onChangeText={setPriceName} />
          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Price</Text>
          <TextInput style={styles.input} value={pricePrice} onChangeText={setPricePrice} keyboardType='numeric'/>

          <TouchableOpacity style={styles.addTaskWrapper} onPress={() => handleAddPrice()}>
            <Icon style={styles.icon} name="save"/>
          </TouchableOpacity>
        
        </KeyboardAvoidingView>
      </Modal>


      {/* Edit Price Modal */}
      <Modal
        animationType="fade"
        statusBarTranslucent={false}
        visible={editPriceModal}
        onRequestClose={() => {setEditPriceModal(false); setDefaultPriceStates();}}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}> 
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity style={styles.sectionTitleRight} onPress={() => {setEditPriceModal(false); setDefaultPriceStates();}}>
              <Text><Icon style={styles.icon} name="arrow-back-ios"/></Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, {marginLeft: 5,}]}>Edit Price</Text>
          </View>

          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Stock</Text>
          <TextInput style={styles.input} autoCapitalize = {"characters"} value={priceName} onChangeText={setPriceName} />
          <Text style={{fontWeight:'bold', fontSize: 12, paddingTop: 10}}>Price</Text>
          <TextInput style={styles.input} value={pricePrice} onChangeText={setPricePrice} keyboardType='numeric'/>

          <TouchableOpacity style={styles.addTaskWrapper} onPress={() => handleModifyPrice()}>
            <Icon style={styles.icon} name="save"/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteTaskWrapper} onPress={() => handleDeletePrice()}>
            <Icon style={styles.icon} name="delete"/>
          </TouchableOpacity>
        </KeyboardAvoidingView>
          
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  tasksWrapper: {
    paddingTop: 20,
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
    fontWeight: 'bold',
    color: '#0d3b7c'
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
    color: '#0d3b7c',
  },
  input: {
    marginVertical: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: '#000',
    borderWidth: 1,
    borderRadius: 30,
    borderColor: '#C0C0C0', 
  },
  dateButton: {
    marginTop: 10,
    paddingVertical: 13,
    paddingHorizontal: 20,
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
    marginTop: 25,
    paddingHorizontal: 10,
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
