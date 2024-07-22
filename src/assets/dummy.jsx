import { Box, Stack, Typography, Menu, MenuItem } from "@mui/material";
import React, { memo, useRef, useState } from "react";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import { server } from "../../constants/config";

const MessageComponent = ({ message, user, onMessageDelete }) => {
  const [openUnsendMenu, setOpenUnsendMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });


  const [deltedMessage, setdeletedMessage] = useState(false);

  const { _id, sender, content, attachments = [], createdAt } = message;

  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).fromNow();

  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent the default context menu
    setMenuPosition({ top: event.clientY, left: event.clientX });
    setOpenUnsendMenu(true); // Open the custom menu
  };

  const toggleUnsendMenu = () => setOpenUnsendMenu(!openUnsendMenu);

  const handleUnsendChat = async () => {
    try {
      const response = await fetch(`${server}/api/v1/chat/message/${_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials if required
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to unsend the message");
      }

      const data = await response.json();
      // console.log(data.message); 


      if (onMessageDelete) {
        onMessageDelete(message._id);
      }
      setdeletedMessage(true);
    } catch (error) {
      console.error("Error unsending message:", error.message || error);
    } finally {
      setOpenUnsendMenu(false); // Close the menu
    }
  };

  if (deltedMessage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "100%", transition: { duration: 2 } }}
      onContextMenu={handleContextMenu} 
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        backgroundColor: sameSender ? "#d9fdd3" : "#ffffff",
        color: "#111b21",
        borderRadius: "10px",
        padding: "1rem",
        maxWidth: "80%",
        minWidth: "150px",
        margin: "0.5rem 0",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        wordWrap: "break-word",
        position: "relative", // Ensure relative positioning for the menu
      }}
    >
      <Stack
        direction="column"
        spacing={1}
        sx={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
          wordBreak: "break-word",
        }}
      >
        {!sameSender && (
          <Typography color={"#2694ab"} fontWeight={"600"} variant="caption">
            {sender.name}
          </Typography>
        )}

        {content && <Typography variant="body1">{content}</Typography>}

        {attachments.length > 0 &&
          attachments.map((attachment, index) => {
            const url = attachment.url;
            const file = fileFormat(url);

            return (
              <Box key={index}>
                <a
                  href={url}
                  target="_blank"
                  download
                  style={{ color: sameSender ? "#004056" : "#2C858D" }}
                >
                  {RenderAttachment(file, url)}
                </a>
              </Box>
            );
          })}

        <Typography variant="caption" color={"text.secondary"}>
          {timeAgo}
        </Typography>
      </Stack>

      {openUnsendMenu && (
        <UnsendMenu
          position={menuPosition}
          onClose={() => setOpenUnsendMenu(false)}
          onUnsend={handleUnsendChat}
        />
      )}
    </motion.div>
  );
};

export default memo(MessageComponent);

const UnsendMenu = ({ position, onClose, onUnsend }) => {
  return (
    <Menu
      open
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={{ top: position.top, left: position.left }}
      sx={{
        width: "8rem",
        height: '8rem',
        padding: '70px'
      }}
      PaperProps={{
        style: {
          transform: "none",
        },
      }}
    >
      <MenuItem
        sx={{
          padding: "0rem",
          cursor: "pointer",
        }}
        onClick={onUnsend}
      >
        <DeleteIcon sx={{ fontSize: "12px" }} />
        <Typography fontSize="10px">Unsend Message</Typography>
      </MenuItem>
    </Menu>
  );
}