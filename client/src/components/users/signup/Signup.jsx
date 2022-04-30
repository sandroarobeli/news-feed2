import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";

import theme from "../../../theme/theme";
import ErrorModal from "../../shared/errorModal/ErrorModal";
import AvatarInput from "../avatarInput/AvatarInput";
import { signup, clearError, selectUserStatus } from "../../../redux/user-slice.js";

export const styles = {
  container: {
    textAlign: "center",
    flexGrow: 1,
    margin: "auto auto 1rem auto",
    borderRadius: "5px",
    maxWidth: {
      mobile: "90%",
      tablet: "60%",
      laptop: "30%",
    },
    padding: "1rem 1rem 3rem 1rem",
  },
  title: {
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    fontWeight: 600,
    color: theme.palette.primary.main,
    margin: "auto",
  },
  inputProps: {
    color: "#000000",
    background: "rgba(0, 91, 187, 0.15)",
    fontWeight: 600,
    fontSize: "1.25rem",
    borderRadius: 0,
    borderBottom: "1px solid #005BBB",
    "&: hover": {
      background: "rgba(0, 91, 187, 0.35)",
    },
  },
  inputLabelProps: {
    color: "#005BBB",
    fontWeight: 400,
  },
  helperTextProps: {
    color: "#005BBB",
  },
  button: {
    padding: "0.75rem",
    fontSize: "1.25rem",
    color: theme.palette.secondary.main,
    background: theme.palette.primary.main,
    borderRadius: "3px",
    boxShadow: "4px 4px 4px rgba(0, 91, 187, 0.35)",
    "&:hover": {
      color: theme.palette.secondary.main,
      background: theme.palette.primary.light,
    },
    "&:active": {
      color: theme.palette.secondary.main,
      background: theme.palette.primary.light,
    },
    "&:disabled": {
      color: theme.palette.secondary.main,
      background: theme.palette.primary.main,
    },
  },
};

const Signup = () => {
  // From Router
  const navigate = useNavigate();

  // from Redux
  const dispatch = useDispatch();
  const userStatus = useSelector(selectUserStatus);

  // Local state
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handler functions
  const handleUserNameChange = (event) => {
    setUserName(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  // FROM HERE: ==> FOR AVATAR, REVERT BACK TO SMALLER FORMAT,
  // FOR MEDIA LOADER KEEP THE WIDE FORMAT AND ADD A SEPARATE CONTROLLER ETC.
  // This picture upload is designed for a single file upload!
  // NOTE: keep current module for avatar and revert to small format,
  // create a new one for video with wide format!
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();

    const typeIsAllowed =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg" ||
      file.type === "image/gif";

    try {
      const signedResponse = await fetch("http://127.0.0.1:5000/api/file/avatar");
      const signedData = await signedResponse.json();
      const url = "https://api.cloudinary.com/v1_1/" + signedData.cloudName + "/auto/upload";

      if (typeIsAllowed) {
        setIsLoading(true);
        formData.append("file", file);
        formData.append("api_key", signedData.apiKey);
        formData.append("timestamp", signedData.timestamp);
        formData.append("signature", signedData.signature);
        //formData.append("eager", "b_auto,c_fill_pad,g_auto,h_150,w_600");
        formData.append("eager", "b_auto,c_pad,h_150,w_150");
        formData.append("folder", "news-feed");
      }
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const imageResponse = await response.json();
      if (!response.ok) {
        setErrorMessage(imageResponse.error.message);
      }
      // const avatarUrl = imageResponse.secure_url; // Original secure URL
      const avatarUrl = imageResponse.eager[0].secure_url; // URL with stylings
      setUserAvatar(avatarUrl);
      setIsLoading(false);
    } catch (error) {
      setErrorMessage(error.message); // Local Error state gets populated by Cloudinary error
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (userStatus === "idle") {
      try {
        await dispatch(signup({ userName, password, userAvatar })).unwrap();
        navigate("/");
      } catch (error) {
        // NOTE: SINCE ERRORS COULD BE GENERATED FROM EITHER CLOUDINARY OR REDUX,
        // AND THERE IS ONLY ONE ERROR MODULE, REDUX ERROR GOES TO LOCAL ERROR STATE
        // AND ONLY THEN GETS REFLECTED IN ERROR MODULE AS ITS TEXT.

        // For debugging only. error gets populated by createAsyncThunk abstraction
        console.log("from SIGNUP submit"); //test
        console.log(error); // test
        setErrorMessage(error); // Local Error state get populated by Redux error
      }
    }
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      setUserName("");
      setPassword("");
      setUserAvatar("");
    };
  }, []);

  const handleErrorClear = () => {
    dispatch(clearError());
    setErrorMessage("");
    setUserName("");
    setPassword("");
    setUserAvatar("");
  };

  return (
    <Box component="form" sx={styles.container} onSubmit={handleSubmit} autoComplete="off">
      <Stack spacing={3} sx={{ alignItems: "center" }}>
        <Typography component="h3" sx={styles.title}>
          SIGN UP
        </Typography>
        <TextField
          fullWidth
          variant="filled"
          aria-label="userName"
          name="userName"
          id="userName"
          label="Username"
          type="text"
          required
          InputProps={{
            sx: styles.inputProps,
          }}
          InputLabelProps={{
            sx: styles.inputLabelProps,
          }}
          value={userName}
          onChange={handleUserNameChange}
        />
        <TextField
          fullWidth
          variant="filled"
          aria-label="password"
          name="password"
          id="password"
          label="Password"
          type="password"
          required
          helperText={
            password && password.length < 6
              ? "Password must be at least 6 characters long"
              : undefined
          }
          InputProps={{
            sx: styles.inputProps,
          }}
          InputLabelProps={{
            sx: styles.inputLabelProps,
          }}
          FormHelperTextProps={{ sx: styles.helperTextProps }}
          value={password}
          onChange={handlePasswordChange}
        />
        <AvatarInput
          onPictureUpload={handleAvatarUpload}
          userAvatar={userAvatar}
          isLoading={isLoading}
        />
        <Button
          type="submit"
          disabled={userStatus === "loading"}
          variant="contained"
          sx={{ ...styles.button, width: "100%" }}
          endIcon={
            userStatus === "loading" ? <CircularProgress color="secondary" size={25} /> : undefined
          }
        >
          {userStatus === "loading" ? "SUBMITTING" : "SUBMIT"}
        </Button>
      </Stack>
      <ErrorModal
        open={!!errorMessage}
        onClose={handleErrorClear}
        clearModal={handleErrorClear}
        errorMessage={errorMessage}
      />
    </Box>
  );
};

export default Signup;