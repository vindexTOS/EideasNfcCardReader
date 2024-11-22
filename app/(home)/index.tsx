import { View, Text, FlatList, TouchableOpacity, Modal, Button, StyleSheet, TextInput , PermissionsAndroid, Alert, ActivityIndicator} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuthUser';
import { GetAllUserInfo } from '@/API/users/userGetRequest';
import { useQuery } from '@tanstack/react-query';
 
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from '@/components/modals/QRCodeScanner';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  balance: number;
  role: string;
  device_users: any[];
  cards: any[];
}

export default function Home() {




 



  const { userInfo } = useAuth();
  const [page, setPage] = useState<number>(1);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [openQRScannerModal, setOpenQRScannerModal] = useState<boolean>(false);
  
  const [scanned, setScanned] = useState(false);

const [openCardAddModal,setOpenCardAddModal] = useState<boolean>(false)
  const { data, isSuccess , isLoading} = useQuery({
    queryKey: ["get-all-users", { id: userInfo?.sub, page, searchQuery }],
    queryFn: () => GetAllUserInfo(userInfo?.sub as string, page, searchQuery),
    enabled: !!userInfo?.sub,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isSuccess && data?.data?.data && data?.data?.data.length > 0) {
      setUsers(data.data.data);
   
    }
    // console.log(data?.data?.data)
  }, [data, isSuccess]);

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleNextPage = () => {
    if (data && data.data.current_page < data.data.total / data.data.per_page) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (data && data.data.current_page > 1) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  const handleScan = (data: string) => {
    setScanned(false);
    console.log(`Scanned data: ${data}`);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>User List</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or email..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          setPage(1); // Reset to page 1 when a new search is made
        }}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleUserPress(item)} style={styles.listItem}>
            <Text style={styles.listItemText}>{`Name: ${item.name}`}</Text>
            <Text style={styles.listItemText}>{`ID: ${item.id}`}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No Users Available</Text>}
      />

      {/* Pagination Controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, page === 1 ? styles.disabledButton : null]}
          onPress={handlePreviousPage}
          disabled={page === 1}
        >
          <Text style={styles.paginationText}>Previous</Text>
        </TouchableOpacity>

        <Text style={styles.paginationInfo}>
          Page {data?.data.current_page} of {Math.ceil(data?.data.total / data?.data.per_paრge)}
        </Text>
      {isLoading &&  <ActivityIndicator/>}
        <TouchableOpacity
          style={[
            styles.paginationButton,
            data?.data.current_page >= Math.ceil(data?.data.total / data?.data.per_page) ? styles.disabledButton : null,
          ]}
          onPress={handleNextPage}
          disabled={data?.data.current_page >= Math.ceil(data?.data.total / data?.data.per_page)}
        >
          <Text style={styles.paginationText}>Next</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {selectedUser && (
              <>
                <Text style={styles.modalHeader}>{selectedUser.name}</Text>
                <Text style={styles.modalText}>{`ID: ${selectedUser.id}`}</Text>
                <Text style={styles.modalText}>{`Email: ${selectedUser.email}`}</Text>
                <Text style={styles.modalText}>{`Phone: ${selectedUser.phone}`}</Text>
                <Text style={styles.modalText}>{`Balance: ${selectedUser.balance}`}</Text>
                <Text style={styles.modalText}>{`Role: ${selectedUser.role}`}</Text>
                <View style={styles.cardsContainer}>
  {selectedUser.cards.map((val: any, index: number) => {
    return (
      <View key={index} style={styles.cardItem}>
        <Text style={styles.cardTitle}>Card Information:</Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Name: </Text>
          {val.name}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.label}>Number: </Text>
          {val.card_number}
        </Text>
      </View>
    );
  })}
</View>
              </>
            )}
            <View style={{display:'flex', justifyContent:"space-between", flexDirection:"row",gap:20}}>          
            <Button title="დახურვა" onPress={() => setModalVisible(false)} />
            <Button title="ბარათის დამატება"    onPress={() => setOpenCardAddModal(true)}  />

            </View>

          </View>
        </View>


     {/* card modal */}


     <Modal
    animationType="slide"
    transparent={true}
    visible={openCardAddModal}
    onRequestClose={() => setOpenCardAddModal(false)}
  >
    <View style={styles.modalBackground}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalHeader}>ბარათის დამატება</Text>
    <View style={{display:"flex", flexDirection:'row', justifyContent:"space-between", width:"100%"}}>
    <Button title="QR კოდით" onPress={() => {   setOpenQRScannerModal(true); }} />
    <Button title="RFD reader" onPress={() => setOpenCardAddModal(false)} />
    <Button title="დახურვა" onPress={() => setOpenCardAddModal(false)} />

    </View>
      </View>
    </View>
      {/* QR Scanner Modal */}
    
  </Modal>
  {/*  */}

      </Modal>
      <QRCodeScanner onScanned={handleScan} />

 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
   display:'flex',
    padding: 16,
    backgroundColor: '#f8f8f8',
    height:"100%"
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    color: '#666',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  paginationButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  paginationText: {
    color: '#fff',
    fontSize: 16,
  },
  paginationInfo: {
    fontSize: 16,
    color: '#333',
  },
  modalBackground: {
 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
 
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  cardsContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  cardItem: {
    backgroundColor: '#fff',
    padding: 5,
    marginBottom: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width:"100%"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007bff',
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  label: {
    fontWeight: 'bold',
    color: '#444',
  },
});
