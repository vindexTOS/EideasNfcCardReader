// import { Image, StyleSheet, Platform, View, Text } from "react-native";
// import React, { useState, useEffect } from "react";
 
// import nfcManager , {NfcEvents}from "react-native-nfc-manager";

// export default function HomeScreen() {
//   const [hasNfc, setHasNfc] = useState<boolean | null>(null);
//   const [cardInfo,setCardInfo] = useState('')
//    async function scanTag(){
//      nfcManager.setEventListener(NfcEvents.DiscoverTag,(tag:any )=> {
//        console.log(tag)
//        setCardInfo(tag)
//      })

//     await  nfcManager.registerTagEvent()
//    }
//   async function checkNf() {
//     const isSupported = await nfcManager.isSupported();
//      if(isSupported){
//        await nfcManager.start()
//      }
//     setHasNfc(isSupported);
//   }
//   useEffect(() => {
//     checkNf();
//   }, []);

//   if (hasNfc) {
//     return (
//       <View>
//         <Text>Your Device Supports NFC </Text>
//         <Text>Your Device Supports NFC </Text>
//         <Text>Your Device Supports NFC </Text>
//         <Text onPress={scanTag} >START</Text>
//         <Text>{JSON.stringify(cardInfo)}</Text>
//       </View>
//     );
//   } else {
//     return (
//       <View>
//         <Text>Your Device DOSE NOT! Supports NFC </Text>
//         <Text>Your Device DOSE NOT! Supports NFC </Text>

//         <Text>Your Device DOSE NOT! Supports NFC </Text>

//         <Text>Your Device DOSE NOT! Supports NFC </Text>
//       </View>
//     );
//   }
// }
