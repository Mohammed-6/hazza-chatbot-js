const { createContext, useState, useCallback, useEffect } = require("react");
import { baseUrl, postRequest, getRequest } from "@/utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [showchat, setshowchat] = useState(false);
  const [cid, setcid] = useState("");
  const [currentchat, setcurrentchat] = useState({
    userId: "",
    senderId: "",
    senderName: "",
    chatId: "",
  });
  const [alert, setalert] = useState({ status: false, type: "", message: "" });
  const [message, setmessage] = useState("");
  const [allmessages, setallmessages] = useState([]);
  const [messageloading, setmessageloading] = useState(false);
  const [socket, setsocket] = useState(null);
  const [istyping, setistyping] = useState(false);
  const [chatinfo, setchatinfo] = useState({
    _id: "",
    name: "Andy",
    userStatus: false,
  });
  const [custom, setcustom] = useState({
    status: false,
    expired: false,
    data: {},
  });

  useEffect(() => {
    const newSocket = io("http://localhost:4000", {
      reconnection: true, // Enable reconnection
      reconnectionAttempts: 5, // Try reconnecting 5 times
      reconnectionDelay: 1000, // Time between attempts (in ms)
      timeout: 20000, // Timeout before considering the connection lost
    });
    setsocket(newSocket);

    newSocket.onAny((eventName, ...args) => {
      console.log(`Received event: ${eventName}`, args);
    });

    if (typeof window !== "undefined") {
      let ccid = "";
      if (localStorage.getItem("hazza-cId") !== null) {
        setcid(window.localStorage.getItem("hazza-cId"));
        ccid = window.localStorage.getItem("hazza-cId");
      } else {
        localStorage.setItem("hazza-cId", "rbb");
        setcid("rbb");
        ccid = "rbb";
      }
      //
      const initBot = async () => {
        await getRequest(baseUrl + "/front/load-bot/" + ccid)
          .then((response) => {
            setcustom({
              status: true,
              expired: false,
              data: response.response.data.custom,
            });
          })
          .catch((error) => {
            setcustom({ status: false, expired: false, data: {} });
          });
      };
      initBot();

      if (localStorage.getItem("hazza-agent-info") !== null) {
        const chat = JSON.parse(localStorage.getItem("hazza-agent-info"));
        setchatinfo({ _id: chat._id, name: chat.name, userStatus: true });
      }

      if (localStorage.getItem("hazza-chat-person") !== null) {
        const chat = JSON.parse(localStorage.getItem("hazza-chat-info"));
        if (newSocket === null) return;
        newSocket.emit("init", { chatId: chat._id });
      }
    }
    //
    return () => {
      newSocket.offAny();
      newSocket.disconnect();
    };
  }, []);

  const toogleChat = useCallback(() => {
    setshowchat(!showchat);
  });

  const InitiateChat = useCallback(async () => {
    if (localStorage.getItem("hazza-user") === null) {
      const check = await postRequest(baseUrl + "/chats/new-user", {
        cId: cid,
      });

      if (check.error === true) {
        if (check.message.status === 400) {
          setalert({
            status: true,
            type: "error",
            message: check.message,
          });
        } else {
          setalert({
            status: true,
            type: "error",
            message: "Something went wrong!",
          });
        }
        return;
      }
      const user = check.response.data;
      // console.log(check, user);
      localStorage.setItem("hazza-user", JSON.stringify(user));
      localStorage.setItem("hazza-packageId", user.packageId);
      const infor = {
        userId: user.userId,
        senderId: user.senderId,
        senderName: user.name,
        chatId: user.chatId,
      };
      setcurrentchat(infor);
    } else {
      const user = JSON.parse(localStorage.getItem("hazza-user"));
      const infor = {
        userId: user.userId,
        senderId: user.senderId,
        senderName: user.name,
        chatId: user.chatId,
      };
      setcurrentchat(infor);

      getRequest(`${baseUrl}/messages/${user.chatId}/msg`)
        .then((res) => {
          //   console.log(res?.response?.data);
          setallmessages(res?.response?.data);
        })
        .catch((err) => {
          console.log(res);
        });
    }
  }, [cid]);

  const updateMessage = (e) => {
    setmessage(e);
    if (socket === null) return;
    const user = JSON.parse(localStorage.getItem("hazza-user"));
    const info = {
      userId: user.senderId,
      senderId: user.senderId,
      chatId: user.chatId,
      message: "",
    };
    socket.emit("isTyping", info);
  };

  const sendMessage = useCallback(async () => {
    setalert({
      status: false,
      type: "",
      message: "",
    });
    if (message === "") {
      return;
    }
    if (
      localStorage.getItem("hazza-chat-person") !== null &&
      localStorage.getItem("hazza-chat-person") === "true"
    ) {
      const tempData = {
        chatId: currentchat?.chatId,
        senderId: currentchat?.senderId,
        text: message,
      };
      const response = await postRequest(`${baseUrl}/messages`, tempData);

      if (response?.error) {
        console.log(response);
        return;
      }
      socket?.emit("sendMessage", tempData);
      // setallmessage((prev) => [...prev, response?.response?.data]);
      setmessage("");
      return () => socket?.off("sendMessage");
    } else {
      setmessageloading(true);
      // return;
      const user = JSON.parse(localStorage.getItem("hazza-user"));
      const infor = {
        cId: cid,
        senderId: user.senderId,
        userId: user.userId,
        text: message,
        chatId: user.chatId,
      };

      const newMsg = {
        chatId: user.chatId,
        senderId: user.senderId,
        text: message,
        createdAt: new Date().toISOString(),
        isForm: false,
        isRead: false,
      };

      setallmessages((prev) => [...prev, newMsg]);
      setallmessages((prev) => [
        ...prev,
        {
          chatId: user.chatId,
          senderId: user.userId,
          text: "",
          createdAt: new Date().toISOString(),
          isForm: false,
          isRead: false,
        },
      ]);

      const tempData = {
        chatId: currentchat?.chatId,
        senderId: currentchat?.userId,
        text: message,
      };
      // console.log(socket);
      socket?.emit("sendMessage", tempData);
      const msg = await postRequest(baseUrl + "/messages/send-message", infor);
      if (msg.error === true) {
        if (msg.response?.status === 400) {
          setalert({
            status: true,
            type: "error",
            message: msg.response.data?.message,
          });
        } else {
          setalert({
            status: true,
            type: "error",
            message: "Something went wrong!",
          });
        }
        return;
      }
      if (msg.response.data.message === "form") {
        // console.log(msg.response.data.chat);
        setallmessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = msg.response.data.chat;
          return updated;
        });
        return;
      }
      // initiate chat to real person
      if (msg.response.data.message === "chat") {
        if (socket === null) return;
        const chat = msg.response.data.chat;
        socket.emit("init", { chatId: chat._id });
        socket.emit("userInit", { userId: user.senderId });
        socket.emit("newInit", {
          chatId: chat._id,
          userId: chat.members[0]._id,
          chatInfo: chat,
        });
        localStorage.setItem("hazza-chat-person", true);
        localStorage.setItem("hazza-chat-info", JSON.stringify(chat));
        localStorage.setItem(
          "hazza-agent-info",
          JSON.stringify(chat.members[0])
        );
        setchatinfo({
          _id: chat.members[0]._id,
          name: chat.members[0].name,
          userStatus: true,
        });
        setmessageloading(false);
        setallmessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = "Chat connected";
          return updated;
        });
        setmessage("");
        return;
      }
      setmessageloading(false);
      setallmessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = msg.response.data.message;
        return updated;
      });
    }
  }, [cid, currentchat, message]);

  useEffect(() => {
    if (socket === null) return;
    socket.on("newMessage", (info) => {
      // console.log("New message:", info);
      setallmessages((prev) => [...prev, info]);
      const readInfo = {
        userId: currentchat.userId,
        chatId: currentchat.chatId,
      };
      socket.emit("messageRead", readInfo);
      postRequest(`${baseUrl}/messages/read`, readInfo);
    });

    return () => {
      socket?.off("newMessage");
    };
  }, [allmessages]);

  useEffect(() => {
    // console.log(socket);
    if (socket === null) return;
    socket.on("typing", function (info) {
      const user = JSON.parse(localStorage.getItem("hazza-user"));
      if (info.senderId !== user.senderId) {
        setistyping(true);
      }
    });
    socket.on("stopTyping", function () {
      setistyping(false);
    });
    return () => {
      socket?.off("typing");
      socket?.off("stopTyping");
    };
  }, [socket]);
  const typingStop = useCallback(async () => {
    if (socket === null) return;
    const user = JSON.parse(localStorage.getItem("hazza-user"));
    const info = {
      userId: user.senderId,
      senderId: user.senderId,
      chatId: user.chatId,
    };
    socket.emit("typingStop", info);
  }, [currentchat]);

  const messageFormSubmit = useCallback(
    async (info) => {
      const newSocket = socket;
      const tempData = {
        chatId: currentchat?.chatId,
        senderId: currentchat?.userId,
        Id: info.Id,
        formId: info.formId,
        triggerId: info.triggerId,
        isFormSubmitted: true,
        text: JSON.stringify(info.formData),
      };

      const response = await postRequest(
        `${baseUrl}/messages/form-submit`,
        tempData
      );

      if (response.error) {
        console.log(response);
        return;
      }

      if (localStorage.getItem("hazza-chat-person") === null) {
        setallmessages((prevMsg) =>
          prevMsg.map((msg) =>
            msg._id === info.Id
              ? {
                  ...msg,
                  isFormSubmitted: true,
                  isForm: true,
                  text: response.response.data.text,
                }
              : msg
          )
        );
      } else {
        setallmessages((prevMsg) =>
          prevMsg.map((msg) =>
            msg._id === info.Id
              ? { ...msg, isFormSubmitted: true, isForm: false }
              : msg
          )
        );
      }
      console.log(response.response.data);

      const tempFormData = {
        chatId: currentchat?.chatId,
        senderId: currentchat?.userId,
        Id: info.Id,
        formId: info.formId,
        triggerId: info.triggerId,
        isFormSubmitted: true,
        text: JSON.stringify(response.response.data),
      };

      newSocket?.emit("sendFormMessage", response.response.data);
    },
    [currentchat, message]
  );

  return (
    <ChatContext.Provider
      value={{
        showchat,
        toogleChat,
        InitiateChat,
        alert,
        currentchat,
        sendMessage,
        allmessages,
        updateMessage,
        message,
        messageloading,
        istyping,
        typingStop,
        messageFormSubmit,
        chatinfo,
        custom,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
