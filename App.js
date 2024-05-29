import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Platform } from "react-native";
import ImageViewer from "./components/ImageViewer";
import Button from "./components/Button";
const placeHolderImage = require("./assets/images/background-image.png");
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import EmojiPicker from "./components/EmojiPicker";
import { captureRef } from "react-native-view-shot";
import CircledButton from "./components/CircledButton";
import IconButton from "./components/IconButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import EmojiList from "./components/EmojiList";
import EmojiSticker from "./components/EmojiSticker";
import * as MediaLibrary from "expo-media-library";
import domtoimage from "dom-to-image";
// const placeHolderImage =
//   "https://images.unsplash.com/photo-1594007759138-855170ec8dc0?q=80&w=1376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// SplashScreen.preventAutoHideAsync();
// setTimeout(SplashScreen.hideAsync, 5000);

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showAppOptions, setShowAppOptions] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pickedEmoji, setPickedEmoji] = useState(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setIsLoading] = useState(false);

  const imageRef = useRef();

  if (status === null) {
    requestPermission();
  }

  const pickImageAsync = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!res.canceled) {
      console.log(res);
      setSelectedImage(res.assets[0].uri);
      setShowAppOptions((prev) => !prev);
    } else {
      alert("you did not select any image");
    }

    console.log(showAppOptions);
  };

  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    setIsModalVisible((prev) => !prev);
  };

  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async () => {
    // we will implement this later
    if (Platform.OS !== "web") {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        setIsLoading((prev) => !prev);
        if (localUri) {
          alert("Saved!");
        }
      } catch (error) {
        console.log(error);
        alert(error);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement("a");
        link.download = "sticker-smash.jpeg";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        alert(error);
        console.log(error);
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.ImageContainer}>
          <View ref={imageRef} collapsable={false}>
            <ImageViewer
              placeHolderImageSource={placeHolderImage}
              selectedImage={selectedImage}
            />
            {pickedEmoji && (
              <EmojiSticker imageSize={50} stickerSource={pickedEmoji} />
            )}
          </View>
        </View>

        {showAppOptions ? (
          <View style={styles.optionsContainer}>
            <View style={styles.optionsRow}>
              <IconButton icon={"refresh"} label={"Reset"} OnPress={onReset} />
              <CircledButton onPress={onAddSticker} />
              <IconButton
                icon={"save-alt"}
                label={"Save"}
                OnPress={onSaveImageAsync}
              />
            </View>
            <Text style={styles.text}>{loading ? "Loading..." : ""}</Text>
          </View>
        ) : (
          <View style={styles.footerContainer}>
            <Button
              label={"Choose a Photo"}
              theme={"primary"}
              onPress={pickImageAsync}
            />
            <Button
              label={"Use this Photo"}
              onPress={() => setShowAppOptions(true)}
            />
          </View>
        )}

        <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
          <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
        </EmojiPicker>

        {/* <Text style={styles.text}>Hello from this App</Text> */}
        <StatusBar style="light" />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  text: {
    fontSize: 34,
    color: "white",

    // fontWeight: "500",
  },
  ImageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },

  footerContainer: {
    flex: 1 / 3,
    alignItems: "center",
  },

  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
  },
});
