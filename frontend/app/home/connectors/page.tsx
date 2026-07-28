"use client";

import { Button } from "@/components/ui/button";
import { getHeaders } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const [iframeUrl] = useState<string | undefined>();
  const [partnerOrigin] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current?.contentWindow?.postMessage(
        {
          theme: theme,
          themeOverride: false,
        },
        partnerOrigin
      );
    }
  }, [partnerOrigin, theme, iframeRef.current]);

  const handleAddConnector = (connectorType: string) => {
    const data = {
      projectId: process.env.NEXT_PUBLIC_SALES_APP_PROJECT_ID,
      theme: theme,
      themeOverride: false,
      connectorType,
      catalogCreateEnabled: false
    };

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/connect`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(async () => {

      const handleMessage = () => {
        window.removeEventListener("message", handleMessage);
      };

      window.addEventListener("message", handleMessage);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Button onClick={() => handleAddConnector("slack")}>Add Slack Connector</Button>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">

        {iframeUrl && (
          <iframe
            src={`${iframeUrl}`}
            width={"100%"}
            ref={iframeRef}
            style={{ height: "calc(100vh - 64px - 4rem)" }}
          />
        )}
      </div>
    </div>
  );
}
