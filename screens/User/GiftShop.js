import React from 'react';
import { View, Text, StyleSheet, Button, Alert, Pressable, FlatList } from 'react-native';
import ItemGridTile from './ItemGridTile';


function GiftShop(){


    const gifts = [
        { id:0,name:"קלמר" , price:80 ,img: require('../../images/gifts/ZIPER.jpeg') },
        { id:1,name:"חבל קפיצה" , price:90 ,img:require("../../images/gifts/JUMP.jpg") },
        {id:2, name:"עכבר מחשב" , price:100 ,img:require("../../images/gifts/COMMOUSE.png") },
        { id:3,name:"כדורגל" , price:120 ,img:require("../../images/gifts/basketball.jpeg") },
        { id:4,name:"כדורסל" , price:120 ,img:require("../../images/gifts/SOCCER.jpg") },
        {id:5 ,name:"אוזניות" , price:150 ,img:require("../../images/gifts/EARING.jpg") },
        { id:6,name:"מקלדת" , price:150 ,img:require("../../images/gifts/KEYBORD.png") },
        {id:7, name:"שעון מעורר" , price:200 ,img:require("../../images/gifts/CLOCK.jpg") },
        {id:8, name:"שובר 50 ₪" , price:260 ,img:require("../../images/gifts/JOYA.jpeg") },
        { id:9,name:"מטען נייד" , price:380 ,img:require("../../images/gifts/CHARGER.jpeg") },
      ];

    function RenderGift(itemData){
        return(
            
            <ItemGridTile 
            title={itemData.item.name} 
            price={itemData.item.price} 
            img={itemData.item.img} 
        />
        );

    };

return(
    <View style={styles.container}>
    <View style={styles.infoContainer}>
        <Text style={styles.info}>
            ברשותך 504 מטבעות
        </Text>
    </View>
    <FlatList
        data={gifts}
        style={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={RenderGift}
        numColumns={2}
    />
     <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>
                עלה ברמה כדי לפתוח מתנות נוספות
            </Text>
        </View>
</View>
);
};




export default GiftShop;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:"#292222"
    },
    infoContainer: {
        padding: 10,
        alignItems: 'flex-end',  
    },
    info: {
        textAlign: 'right',     
        writingDirection: 'rtl',  
        fontSize: 16,
        fontWeight: 'bold',
        color:"white"
    },
    list: {
        flex: 1,
        marginBottom: 10, // מרווח מהטקסט התחתון
    },
    bottomContainer: {
        padding: 10,
        alignItems: 'flex-end',
    },
    bottomText: {
        textAlign: 'right',
        writingDirection: 'rtl',
        fontSize: 14,
        color:'white'
    }
    
});