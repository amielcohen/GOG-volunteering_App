import { StyleSheet ,View,TextInput,Button} from "react-native";
import { useState } from "react";

function VarInput(props){
    const [enteredText, setEnteredText] = useState('');

    function textImputHandler(enteredText){

        setEnteredText(enteredText);
      }
    
    function addtextHandler(){
        props.onadd(enteredText);
        setEnteredText('');
    }

    

return(
    <View style={styles.inputNbutton}>
        <TextInput style={styles.dummyText} placeholder='enter'
         onChangeText={textImputHandler}
         value={enteredText} 
         keyboardType="number-pad"
         />
        <Button title='add' onPress={addtextHandler}/>
      </View>
);
};
export default VarInput

const styles=StyleSheet.create({

    dummyText:{
        borderWidth:1,
        width:'80%',
        color:"red",
        borderColor:"#cccccc",
        marginRight:8,
        padding:10
    
      },
    
      inputNbutton:{
        flexDirection: 'row',
        justifyContent: 'space-between'
    
      },
});