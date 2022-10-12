import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

const Price = (props) => {

  return (
    <View style={styles.item}>
      <View style={styles.itemRow}>
        <Text style={[styles.itemText, {fontWeight: 'bold'}]}>{props.text.priceName}</Text>
        <Text style={[styles.itemText, {textAlign:'right'}]}>{"$" + props.text.pricePrice}</Text>
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

export default Price;