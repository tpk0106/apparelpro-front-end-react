import { Box } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";

// https://codesandbox.io/p/sandbox/material-ui-image-upload-component-9s8u0?file=%2Fsrc%2FImageUpload.js

// Update this type definition
type userData = {
  setParentState: (val: string) => void;
  currentImg?: File | string | null; // Add string and null here
};

const ImageFileUpload = ({ setParentState, currentImg }: userData) => {
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [selectedImageName, setSelectedImageName] = useState<string>("");

  useEffect(() => {
    if (currentImg) {
      if (currentImg instanceof File) {
        // User just selected a new file - Create Preview
        // const objectUrl = URL.createObjectURL(currentImg);
        // setSelectedImage(objectUrl);
        // return () => URL.revokeObjectURL(objectUrl);
      } else if (
        typeof currentImg === "string" &&
        currentImg.startsWith("blob:")
      ) {
        // It's already a blob URL
        setSelectedImage(currentImg);
      } else {
        // It's a Dataverse string/ID - Don't try to render it as an <img> src directly
        setSelectedImage(undefined);
      }
    } else {
      setSelectedImage(undefined);
    }
  }, [currentImg]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedImageName(file.name);
    // Send the FILE object, not the base64 string
    setParentState(file);
  };

  return (
    <Box
      sx={{
        margin: 0,
        padding: 0,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
      }}
    >
      {selectedImage && (
        <img
          src={selectedImage}
          alt={selectedImageName}
          style={{
            maxWidth: "150px",
            maxHeight: "150px",
            objectFit: "cover",
            borderRadius: ".325rem",
            display: "block",
            marginBottom: "8px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
          }}
        />
      )}
      <TextField
        type="file"
        onChange={handleFileUpload}
        // ... rest of your props\
        sx={{
          ".MuiOutlinedInput-root": {
            flexDirection: "row",
            backgroundColor: "#fff",
            width: "250px",
            height: "60px",
            border: "4px",
            borderColor: "#000000",
          },
        }}
        slotProps={{
          input: {
            inputProps: {
              accept: "image/png, image/gif, image/jpeg, image/jpg",
            },
          },
        }}
        placeholder={selectedImageName}
      />
    </Box>
  );
};

export default ImageFileUpload;
