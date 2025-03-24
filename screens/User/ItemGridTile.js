import { Image,Pressable, View ,Text,StyleSheet,Platform} from "react-native";

function ItemGridTile({title,price,img}){

    return(
        <View style={styles.griditem}>
            <Pressable android_ripple={{color:'#ccc'}}
             style={({pressed})=>[styles.button ,pressed ? styles.buttonPressed: null,]}>


                <View style={styles.innerContanier}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                    <Text>מחיר {price}</Text>
               <Image 
                    source={img} 
                    style={{ width: 100, height: 100 }} 
                    resizeMode="cover"
                    onError={(error) => console.log('Error loading image:', error)}
                />

                </View>

               
            </Pressable>
        </View>
    );
};

export default ItemGridTile


const styles = StyleSheet.create({
    griditem:{
        flex:1,
        margin:16,
        hight:250,
        borderRadius:8,
        elevation:4,
        backgroundColor:'white',
        shadowColor:'black',
        shadowOffset:0.25,
        shadowOffset:{width:0, height:2},
        shadowRadius:8,
        overflow: Platform.OS==='android'? 'hidden':'visible',
    },
    innerContanier:{
        flex:1,
        padding:16,
        justifyContent:'center',
        alignItems:"center"

    },

    button:{
        flex:1

    },

    title:{

        fontWeight: 'bold',
        fontSize: 18,
    },

    buttonPressed:{
        opacity:0.5
    }



});