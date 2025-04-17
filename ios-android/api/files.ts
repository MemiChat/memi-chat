import { fetch } from "expo/fetch";
import { GENERIC_SUCCESS_MESSAGE, API_URL } from "@/lib/helper";
import * as FileSystem from "expo-file-system";

export async function uploadFile(base64Data: string, mimeType: string) {
  try {
    const resp = await fetch(`${API_URL}/v1/public/files/file`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ base64Data, mimeType }),
    });

    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return data.url;
    }
  } catch (error) {
    console.error("Upload error:", error);
  }

  return null;
}

export async function uploadMultipartFile(
  uri: string,
  mimeType: string
): Promise<string | null> {
  try {
    const uploadResult = await FileSystem.uploadAsync(
      `${API_URL}/v1/public/files/file`,
      uri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "file",
        mimeType: mimeType,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (uploadResult.status === 201) {
      const responseJson = JSON.parse(uploadResult.body);
      return responseJson.url;
    }
  } catch (error) {
    console.error("Upload error:", error);
  }

  return null;
}
