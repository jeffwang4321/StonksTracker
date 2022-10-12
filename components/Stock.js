import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

const Stock = (props) => {
  let status = "Buy";
  if(!props.text.buying){
    status = "Sell";
  }

  return (
    <View style={styles.item}>
      <View style={styles.itemRow}>
        <Text style={styles.itemText}><Text style={{fontWeight: 'bold'}}>{props.text.stockName}</Text>{"  "}<Text style={{color:'grey'}}>{status}</Text></Text>
        <Text style={[styles.itemText, {textAlign:'right'}]}>{props.text.date.slice(0,-5) + "," + props.text.date.slice(-5)}</Text>
      </View>
      <View style={styles.itemRow}>
        <Text style={[styles.itemText]}>{props.text.stockShares + " x $" + props.text.stockPrice}</Text>
        <Text style={[styles.itemText, {textAlign:'right', fontWeight: 'bold'}]}>{"$" + (props.text.stockShares * props.text.stockPrice).toFixed(2)}</Text>
      </View>     
    </View>
  )
}

const styles = StyleSheet.create({
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

export default Stock;