import { Box, Button, Input } from "@mui/material";
import { TextField } from "@mui/material";
import { useState } from "react";

// https://codesandbox.io/p/sandbox/material-ui-image-upload-component-9s8u0?file=%2Fsrc%2FImageUpload.js

type flagData = { setParentState: (val: any) => void };
const ImageUpload = ({ setParentState }: flagData) => {
  const [selectedImage, setSelectedImage] = useState<any>();
  // const [countryFlag, setCountryFlag] = useState<any | null>();
  // string | ArrayBuffer | null | undefined
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  const handleFileUpload = (event: any) => {
    const file = event.currentTarget?.files[0];
    setSelectedImageName(file.name);
    const reader = new FileReader();
    const url = reader.readAsDataURL(file);

    reader.onloadend = () => {
      setSelectedImage(reader.result);
      let flg;
      if (typeof reader.result == "string") {
        flg = reader?.result?.substring(22); // length of  'data:image/png;base64,'
      }

      //  setCountryFlag(flg);
      // console.log("COUNTRY FLAG SET in Upload comp: ", flg);
      // console.log("setCOUNTRYFLG : ", countryFlag);
      setParentState(flg);
    };
  };

  return (
    <>
      <Box
        sx={{
          margin: 0,
          padding: 0,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
          // border: "2px solid red",
        }}
      >
        <img
          src={selectedImage}
          alt={selectedImageName}
          style={{
            maxWidth: "40px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
            marginBottom: "5px",
            borderRadius: ".125rem",
          }}
        />

        <TextField
          type={"file"}
          sx={{
            ".MuiOutlinedInput-root": {
              flexDirection: "row",
              backgroundColor: "#fff",
              width: "250px",
              height: "60px",
            },
            // img: {
            //   // paddingRight: "1rem",
            // },
            // img: {
            //   maxWidth: "10px",
            //   height: "auto",
            //   // paddingRight: "1rem",
            //   // width: "10rem",
            // },
          }}
          slotProps={{
            input: {
              inputProps: { accept: "image/png, image/gif, image/jpeg" },
            },
          }}
          onChange={(e) => {
            handleFileUpload(e);
          }}
          placeholder={selectedImageName}
          // value={selectedImage}
        />
      </Box>
    </>
  );
};

export default ImageUpload;
