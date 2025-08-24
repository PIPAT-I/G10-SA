import React from "react";
import { message } from "antd";

// Modern message wrapper
export const useModernMessage = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showMessage = React.useCallback(
    (type: "success" | "error" | "warning" | "info", content: string) => {
      messageApi[type](content);
    },
    [messageApi]
  );

  return { messageApi, contextHolder, showMessage };
};
