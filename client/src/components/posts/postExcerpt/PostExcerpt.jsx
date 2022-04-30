import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

import PostAuthor from "../postAuthor/PostAuthor";
import TimeStamp from "../timeStamp/TimeStamp";
import DeleteModal from "../../shared/deleteModal/DeleteModal";
import { selectUserId, selectToken } from "../../../redux/user-slice.js";
import { deletePost, upvotePost, downvotePost } from "../../../redux/posts-slice";

const styles = {
  container: {
    maxWidth: "80vw",
    minWidth: "275px",
    padding: "0.25rem",
    margin: "1rem auto auto auto",
    // height: "250px", // test
  },
  cardActions: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reactions: {
    color: "#000000",
    marginLeft: "0.5rem",
  },
};

const reactionEmoji = {
  thumbsUp: "👍",
  thumbsDown: "👎",
};

const PostExcerpt = (props) => {
  // From Redux
  const dispatch = useDispatch();
  const loggedUserId = useSelector(selectUserId);
  const userToken = useSelector(selectToken);

  // Local state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Handler functions
  const handleDeleteModalOpen = () => {
    setDeleteModalOpen(true);
  };
  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  const handleUpvote = async () => {
    try {
      await dispatch(upvotePost({ postId: props.postId })).unwrap();
    } catch (error) {
      // For debugging only. error gets populated by createAsyncThunk abstraction
      console.log("from UPVOTE submit"); //test
      console.log(error); // test
    }
  };

  const handleDownvote = async (postId) => {
    try {
      await dispatch(downvotePost({ postId: props.postId })).unwrap();
    } catch (error) {
      // For debugging only. error gets populated by createAsyncThunk abstraction
      console.log("from DOWNVOTE submit"); //test
      console.log(error); // test
    }
  };

  const handleDeletePost = async () => {
    setDeleteModalOpen(false);
    try {
      await dispatch(deletePost({ userToken, postId: props.postId })).unwrap();
    } catch (error) {
      console.log("from DELETE POST submit"); //test
      console.log(error); // test
    }
  };
  // Depending on what media format gets uploaded, image type or video type,
  // CardMedia component attribute gets adjusted accordingly.
  // Much like NewPost functionality.
  const mediaFormat = props.media.slice(props.media.length - 3);
  return (
    <>
      <Card sx={styles.container}>
        <CardActionArea
          component={RouterLink}
          to={`../view/${props.postId}`}
          aria-label="view single post"
        >
          <CardContent>
            <PostAuthor author={props.author} authorAvatar={props.authorAvatar} />
            <TimeStamp timestamp={props.timestamp} />
            <Typography variant="body1" component="p" color="text">
              {props.content}
            </Typography>
          </CardContent>
          {props.media && (
            <CardMedia
              component={
                mediaFormat === "png" ||
                mediaFormat === "jpeg" ||
                mediaFormat === "jpg" ||
                mediaFormat === "gif"
                  ? "img"
                  : "iframe"
              }
              height="150"
              image={props.media}
              alt="visual media"
            />
          )}
        </CardActionArea>
        <CardActions sx={styles.cardActions}>
          <Box>
            <Button onClick={handleUpvote}>
              {reactionEmoji.thumbsUp}
              <Typography variant="body1" sx={styles.reactions}>
                {props.reactions.thumbsUp}
              </Typography>
            </Button>
            <Button onClick={handleDownvote}>
              {reactionEmoji.thumbsDown}
              <Typography variant="body1" sx={styles.reactions}>
                {props.reactions.thumbsDown}
              </Typography>
            </Button>
          </Box>
          {loggedUserId === props.authorId && (
            <Box sx={{ marginRight: "2rem" }}>
              <Button
                component={RouterLink}
                to={`../edit/${props.postId}`}
                size="small"
                color="primary"
              >
                EDIT
              </Button>
              <Button size="small" color="error" onClick={handleDeleteModalOpen}>
                DELETE
              </Button>
            </Box>
          )}
        </CardActions>
      </Card>
      <DeleteModal
        open={deleteModalOpen}
        onClose={handleDeleteModalClose}
        cancelDelete={handleDeleteModalClose}
        confirmDelete={handleDeletePost}
      />
    </>
  );
};

export default PostExcerpt;