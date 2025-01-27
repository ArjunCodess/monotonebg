"use server"

import { removeBackground } from "@imgly/background-removal"

export async function processImage(formData: FormData) {
  const file = formData.get("image") as File

  if (!file) {
    throw new Error("No file uploaded")
  }

  try {
    const removedBgBlob = await removeBackground(file)
    
    const blobArrayBuffer = await removedBgBlob.arrayBuffer()
    const base64String = Buffer.from(blobArrayBuffer).toString('base64')
    
    return `data:image/png;base64,${base64String}`
  } catch (error) {
    console.error("Error processing image:", error)
    throw new Error("Failed to process image")
  }
}