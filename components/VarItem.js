import { StyleSheet,View,Text,Pressable } from "react-native";


function VarItem(props){

    return(
        <Pressable onPress={props.delete.bind(this,props.id)}>
            <View style={styles.list}>
                <Text style={{color:'white', padding:5,margin:5,justifyContent:'center',alignContent:'center'}}>{props.text}</Text>
            </View>
       </Pressable>
    );
};


export default VarItem;


const styles=StyleSheet.create({

    list:{
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ed7f5a',
        borderRadius: 6,
    
      },
});