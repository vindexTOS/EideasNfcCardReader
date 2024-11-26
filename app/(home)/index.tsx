import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Button,
  StyleSheet,
  TextInput,
  PermissionsAndroid,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuthUser";
import { GetAllUserInfo, GetSingleUserInfo } from "@/API/users/userGetRequest";
import { useMutation, useQuery } from "@tanstack/react-query";

import { RNCamera } from "react-native-camera";
import QRCodeScanner from "@/components/modals/QRCodeScanner";
import { cardType } from "@/types/Card.Type";
import { CreatCard } from "@/API/cards/createCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openQRScannerModal, setOpenQRScannerModal] = useState<boolean>(false);
  const [qrCodeData, setQrCodeData] = useState<any>();
  const [scanned, setScanned] = useState(false);
  const [cardName, setCardName] = useState("");
  const [openCardAddModal, setOpenCardAddModal] = useState<boolean>(false);

  const router = useRouter();

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: ["get-all-users", { id: userInfo?.sub, page, searchQuery }],
    queryFn: () => GetAllUserInfo(userInfo?.sub as string, page, searchQuery),
    enabled: !!userInfo?.sub,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    keepPreviousData: true,
  });

  const getSingleUser = useMutation({
    mutationFn: (id: string) => {
      return GetSingleUserInfo(id);
    },
  });

  const openSingleUser = async (id: string, item: User) => {
    await getSingleUser.mutateAsync(id);
    setSelectedUser(item);
  };

  const reFetchCards = async () => {
    await getSingleUser.mutateAsync(String(selectedUser?.id));
  };

  const createCardMutation = useMutation({
    mutationFn: (body: cardType) => {
      return CreatCard(body);
    },
    onSuccess() {
      reFetchCards();
      setQrCodeData("");

      setTimeout(() => {
        setOpenCardAddModal(false);
      }, 1000);
    },
    onError() {
      Alert.alert(
        "ბარათის დამატება ვერ მოხერხდა!",
        "ბარათი უკვე არსებობს ან მომხარებელს ლიმიტ ამოეწურა",
        [{ text: "OK" }]
      );
    },
  });

  const handleCardCreation = async () => {
    let randomString = "";
    if (!cardName) {
      const l = "abcdfghklmnopqrstyxz1234567890abcdfg098765631abcd";

      for (let i = 0; i < 8; i++) {
        randomString +=
          l.split("")[Math.floor(Math.random() * l.split("").length)];
      }
    }

    const body: cardType = {
      userId: String(selectedUser?.id),
      name: cardName ? cardName : randomString,
      card_number: qrCodeData.split(" ").join(""),
    };

    await createCardMutation.mutateAsync(body);
  };
  useEffect(() => {
    if (isSuccess && data?.data?.data && data?.data?.data.length > 0) {
      setUsers(data.data.data);
    }
  }, [data, isSuccess]);

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

  useEffect(() => {
    console.log(qrCodeData);
    if (qrCodeData) {
      setOpenQRScannerModal(false);
    }
  }, [qrCodeData]);

  const logout = async () => {
    Alert.alert(
      "Confirm Logout",
      "დარწმუნებული ხართ რომ გსურთ გასვლა ?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.clear(); // Clear the token
            router.push("/(auth)"); // Redirect to login page
          },
        },
      ],
      { cancelable: true }
    );
  };
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.Buttoncontainer}>
          <Text style={styles.userListText}>User List</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setPage(1);
          }}
        />
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openSingleUser(String(item.id), item)}
              style={styles.listItem}
            >
              <Text style={styles.listItemText}>{`Name: ${item.name}`}</Text>
              <Text style={styles.listItemText}>{`ID: ${item.id}`}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Users Available</Text>
          }
        />

        {/* Pagination Controls */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[
              styles.paginationButton,
              page === 1 ? styles.disabledButton : null,
            ]}
            onPress={handlePreviousPage}
            disabled={page === 1}
          >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            Page {data?.data.current_page} of
            {Math.ceil(data?.data.total / data?.data.per_page)}
          </Text>
          {isLoading && <ActivityIndicator />}
          <TouchableOpacity
            style={[
              styles.paginationButton,
              data?.data.current_page >=
              Math.ceil(data?.data.total / data?.data.per_page)
                ? styles.disabledButton
                : null,
            ]}
            onPress={handleNextPage}
            disabled={
              data?.data.current_page >=
              Math.ceil(data?.data.total / data?.data.per_page)
            }
          >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={getSingleUser.isSuccess}
          onRequestClose={() => getSingleUser.reset()}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              {selectedUser && (
                <>
                  <View>
                    <Text style={styles.modalHeader}>{selectedUser.name}</Text>
                    <Text
                      style={styles.modalText}
                    >{`ID: ${selectedUser.id}`}</Text>
                    <Text
                      style={styles.modalText}
                    >{`Email: ${selectedUser.email}`}</Text>
                    <Text
                      style={styles.modalText}
                    >{`Phone: ${selectedUser.phone}`}</Text>
                    <Text
                      style={styles.modalText}
                    >{`Balance: ${selectedUser.balance}`}</Text>
                  </View>
                  <ScrollView contentContainerStyle={styles.cardsContainer}>
                    {getSingleUser?.data?.data.map(
                      (val: any, index: number) => {
                        return (
                          <View key={index} style={styles.cardItem}>
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
                      }
                    )}
                  </ScrollView>
                </>
              )}
              <View
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  gap: 20,
                }}
              >
                <Button title="დახურვა" onPress={() => getSingleUser.reset()} />
                <Button
                  title="ბარათის დამატება"
                  onPress={() => setOpenCardAddModal(true)}
                />
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
                {/* <Text>{qrCodeData}</Text> */}
                <View style={styles.containerInput}>
                  <View>
                    <Text style={{ fontSize: 10, marginBottom: 10 }}>
                      სახელი არა არის სავალდებულო!, თუ არ შეავსებთ მიენიჭება
                      რენდომ იდენტიფიკატორი
                    </Text>
                    <TextInput
                      onChangeText={setCardName}
                      style={styles.input}
                      placeholder="შეავსეთ ხელით"
                      placeholderTextColor="#888"
                    />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={qrCodeData}
                    onChangeText={setQrCodeData}
                    placeholder="შეავსეთ ბარათის ნომერი"
                    placeholderTextColor="#888"
                  />
                  {qrCodeData && (
                    <Button
                      onPress={() => handleCardCreation()}
                      title="დამატება"
                    />
                  )}
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Button
                    title="QR კოდით"
                    onPress={() => {
                      setOpenQRScannerModal(true);
                    }}
                  />
                  <Button
                    title="RFD reader"
                    onPress={() => setOpenCardAddModal(false)}
                  />
                  <Button
                    title="დახურვა"
                    onPress={() => setOpenCardAddModal(false)}
                  />
                </View>
              </View>
            </View>
            {/* QR Scanner Modal */}
          </Modal>
        </Modal>

        <Modal
          animationType="slide"
          transparent={false}
          visible={openQRScannerModal}
          onRequestClose={() => {
            setOpenQRScannerModal(false);
          }}
        >
          <QRCodeScanner setQrCodeData={setQrCodeData} />
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // This makes SafeAreaView fill the entire screen
    backgroundColor: "white",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  listItemText: {
    fontSize: 16,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
    color: "#666",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  paginationButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  paginationText: {
    color: "#fff",
    fontSize: 16,
  },
  paginationInfo: {
    fontSize: 16,
    color: "#333",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    height: "85%",
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsContainer: {
    padding: 10,
  },
  scrollViewContainer: {
    height: 300, // Set a specific height for the scrollable area
  },
  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    width: 300,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  containerInput: {
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  Buttoncontainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    marginBottom: 20,
  },
  userListText: {
    fontSize: 18,
    color: "white",
  },
  logoutButton: {
    backgroundColor: "#ff073a", // Red color for the button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
