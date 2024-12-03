import { ChatContext, ChatContextProvider } from "@/context/chatContext";
import {
  ChatBubbleLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useContext, useEffect, useRef, useState } from "react";
import { format, isSameDay } from "date-fns";
import { objectToTable } from "@/utils/services";

const ChatBot = () => {
  return (
    <>
      <div className="">
        <ChatContextProvider>
          <Chat />
        </ChatContextProvider>
      </div>
    </>
  );
};

const Chat = () => {
  const { showchat, toogleChat, custom } = useContext(ChatContext);
  return (
    <>
      {custom.status === true && !custom.expired && (
        <div className="fixed inset-0 md:absolute md:inset-auto md:bottom-12 md:right-12">
          {!showchat && (
            <ChatBubbleLeftIcon
              className="w-16 p-4 rounded-xl cursor-pointer"
              style={{
                backgroundColor: custom.data?.bbg,
                stroke: custom.data?.bicc,
                fill: custom.data?.bicc,
              }}
              onClick={toogleChat}
            />
          )}
          <div className="">{showchat && <Box />}</div>
        </div>
      )}
    </>
  );
};

const Box = () => {
  const {
    toogleChat,
    alert,
    InitiateChat,
    currentchat,
    sendMessage,
    allmessages,
    updateMessage,
    message,
    istyping,
    typingStop,
    chatinfo,
    custom,
  } = useContext(ChatContext);
  const messagesEndRef = useRef(null); // Ref for the messages container
  const typingTimeoutRef = useRef();

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [allmessages]);

  const formChange = (e) => {
    updateMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to detect typing has stopped (2 seconds of inactivity)
    typingTimeoutRef.current = window.setTimeout(() => {
      typingStop();
    }, 2000); // 2 seconds delay
  };

  useEffect(() => {
    // Cleanup timeout when component unmounts
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    InitiateChat();
  }, []);
  const formatMessageDate = (date) => {
    return format(date, "MMMM d, yyyy"); // Example format: "October 13, 2024"
  };

  return (
    <>
      <div className="h-auto w-auto">
        <div
          className="p-4 flex items-center justify-between shrink-0 w-[375px] rounded-ss-lg rounded-se-lg"
          style={{ backgroundColor: custom.data?.chc }}
        >
          <div className="">
            <div className="flex items-center gap-x-3">
              <div>
                {chatinfo.userStatus ? (
                  <img
                    src="https://cdn-icons-png.freepik.com/512/8742/8742495.png"
                    className="w-10 rounded-full false"
                  />
                ) : (
                  <RobotSVG />
                )}
              </div>
              <div>
                <div className="text-white font-bold">
                  HI! {chatinfo.name} here..
                </div>
                <div className="text-white text-xs">
                  {istyping ? "typing..." : ""}
                </div>
              </div>
            </div>
          </div>
          <div>
            <XMarkIcon
              className="w-6 stroke-white cursor-pointer"
              onClick={toogleChat}
            />
          </div>
        </div>
        <div
          className="border border-gray-100 min-h-[375px] max-h-[400px] overflow-scroll w-[375px] px-3"
          style={{ backgroundColor: custom.data?.cbc }}
        >
          {allmessages &&
            allmessages.map((message, index) => {
              const showDateSeparator =
                index === 0 || // Show for the first message
                !isSameDay(
                  message.createdAt,
                  allmessages[index - 1]?.createdAt
                ); // Show if this message is on a different day
              return (
                <>
                  <div>
                    {showDateSeparator && (
                      <div className="flex justify-center clear-both">
                        <div className="bg-white px-4 py-2 text-sm rounded-xl">
                          {isSameDay(message.createdAt, new Date())
                            ? "Today"
                            : formatMessageDate(message.createdAt)}
                        </div>
                      </div>
                    )}
                    <div>
                      {message?.senderId !== currentchat.senderId ? (
                        <>
                          <div className="flex items-end gap-x-2 my-2">
                            <div className="">
                              {chatinfo.userStatus ? (
                                <img
                                  src="https://cdn-icons-png.freepik.com/512/8742/8742495.png"
                                  className="w-10 rounded-full false"
                                />
                              ) : (
                                <RobotSVG />
                              )}
                            </div>
                            <div
                              className={`bg-gray-100 text-slate-800 rounded-xl
                              } py-2 px-4 max-w-[80%] text-sm`}
                            >
                              {message.text === "" ? (
                                <div className="flex gap-x-1 py-1">
                                  <div className="w-3 h-3 bg-slate-800 rounded-full animate-bounce"></div>
                                  <div className="w-3 h-3 bg-slate-800 rounded-full animate-bounce animate-bounce-delay-1"></div>
                                  <div className="w-3 h-3 bg-slate-800 rounded-full animate-bounce animate-bounce-delay-2"></div>
                                </div>
                              ) : (
                                <>
                                  {message.isForm === true &&
                                  message.isFormSubmitted === false ? (
                                    <LoadForm
                                      form={message.formId}
                                      msg={message}
                                    />
                                  ) : message.isForm === true &&
                                    message.isFormSubmitted === true ? (
                                    message.text &&
                                    objectToTable(JSON.parse(message.text))
                                  ) : (
                                    message.text
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-end my-2">
                            <div
                              className="text-gray-100 rounded-full py-2 px-4 max-w-[80%] text-sm"
                              style={{
                                backgroundColor: custom.data?.cc,
                              }}
                            >
                              {message.text}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              );
            })}

          <div className="py-2">
            {alert.status && (
              <div
                className={`${
                  alert.type === "error"
                    ? "bg-red-100 text-red-500"
                    : alert.type === "success"
                    ? "bg-green-100 text-green-500"
                    : ""
                } px-3 py-2 rounded-lg`}
              >
                {alert.message}
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        <div className="bg-white border border-gray-100 shadow-lg w-[375px] rounded-ee-lg rounded-es-xl p-2">
          <div className="flex items-center gap-x-4">
            <div className="w-full">
              <textarea
                className="rounded-full border bg-gray-200 text-md px-2 py-1 focus:border-black focus:ring-black focus:ring-opacity-75 focus:outline-0 duration-150 w-full h-8 appearance-none resize-none"
                onChange={formChange}
                value={message}
              ></textarea>
            </div>
            <div className="">
              <ChevronRightIcon
                className="w-8 stroke-white p-2 rounded-full cursor-pointer"
                onClick={sendMessage}
                style={{
                  backgroundColor: custom.data?.cc,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const LoadForm = (props) => {
  const { messageFormSubmit, custom } = useContext(ChatContext);
  const [formdata, setformdata] = useState();
  const [collectdata, setcollectdata] = useState({});
  const [alert, setalert] = useState({ status: false, message: "" });
  useEffect(() => {
    if (props.form !== undefined) {
      console.log(props);
      setformdata(props.form);
      formdata &&
        formdata?.formData.map((data) => {
          collectdata[data.name] = data.default;
        });
    }
  }, []);

  const formChange = (e) => {
    const evt = e.target;
    setcollectdata({ ...collectdata, [evt.name]: evt.value });
  };

  const formSubmit = async (e) => {
    e.preventDefault();
    setalert({ status: false, message: "" });
    formdata.formData.map((data) => {
      Object.keys(collectdata).some((key) => {
        if (key === data.name && data.required === true && !collectdata[key]) {
          setalert({ status: true, message: "*Some fileds are missing" });
          return;
        }
      });
    });
    // console.log(props.msg.formId);
    await messageFormSubmit({
      Id: props.msg._id,
      chatId: props.msg.chatId,
      formId: props.msg.formId._id,
      triggerId: props.msg.formId.triggerId,
      formData: collectdata,
    });
  };
  return (
    <>
      <div className="max-w-[250px] min-w-[250px]">
        <form onSubmit={formSubmit}>
          {formdata &&
            formdata?.formData.map((dd, k) => (
              <>
                <div className="py-1">
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <label className="flex">
                        {dd.label}
                        {dd.required && <div className="text-red-500">*</div>}
                      </label>
                    </div>
                  </div>
                  <input
                    type={dd.type}
                    name={dd.name}
                    value={collectdata[dd.name]}
                    className="form-input"
                    placeholder={dd.placeholder}
                    onChange={formChange}
                    required={dd.required}
                  />
                </div>
              </>
            ))}
          <div className="py-1">
            <div className="flex justify-between items-center">
              <div>
                <button
                  type="submit"
                  className="text-white rounded-lg px-5 py-2"
                  style={{
                    backgroundColor: custom.data?.cc,
                  }}
                >
                  Submit
                </button>
              </div>
              <div></div>
            </div>
          </div>
          {alert.status && (
            <div className="bg-red-100 text-red-500 px-2 py-1 rounded-lg">
              {alert.message}
            </div>
          )}
        </form>
      </div>
    </>
  );
};

const RobotSVG = () => {
  return (
    <>
      <svg
        id="Layer_1"
        data-name="Layer 1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 122.88 119.35"
        className="h-10 p-1 bg-slate-100 rounded-full"
      >
        <title>chatbot</title>
        <path d="M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z" />
      </svg>
    </>
  );
};

export default ChatBot;
