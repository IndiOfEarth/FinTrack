import { supabase } from "./supabaseClient";
// REFERENCE - https://docs.expo.dev/versions/latest/sdk/imagemanipulator/
import * as ImageManipulator from "expo-image-manipulator"; // an API to modify images stored ont eh local file system

// Convert the URI to an ArrayBuffer for Supabase upload
// The camera/image picker gives a file path URI, but Supabase will want a binary data file
async function uriToArrayBuffer(uri) {
    const res = await fetch(uri);
    return await res.arrayBuffer();
}

// This function takes the image file path, transaction ID, uploads the image to storage
export async function uploadReceipt({ localUri, transactionId }) {
    // Get the current user
    // Also keep the receipts separated by user, secure and organised
    // The storage path will be e.g: "receipts/{userId}/{transactionId}.jpg"
    const { data: { user }, error: userErr } = await supabase.auth.getUser();

    // if the user isn't logged in
    if (userErr) throw userErr;
    if (!user) throw new Error("Not logged in.");

    // Compress/resize image to keep uploads small for Supabase
    const manipulated = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );

  const arrayBuffer = await uriToArrayBuffer(manipulated.uri);

    // Define the storage path: receipts/{userId}/{transactionId}.jpg
    const path = `${user.id}/${transactionId}.jpg`;

    // Upload to Supabase storage
    // REFERENCE - https://supabase.com/docs/guides/storage
    // Alot of reference for how to use Supabase storage buckets from:
    // REFERENCE - https://supabase.com/docs/guides/storage/quickstart?queryGroups=language&language=dashboard&queryGroups=database-method&database-method=dashboard
    const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, arrayBuffer, {
            contentType: "image/jpeg",
            upsert: true
        });

    if (uploadError) throw uploadError;

    // returns the storage path that is stored inteh database
    return path;
}

// Getting a signed url to show the image
export async function getReceiptSignedUrl(receiptPath) {
    const { data, error } = await supabase.storage.from("receipts").createSignedUrl(receiptPath, 60 * 10);

    // defensive coding if an error is thrown
    if (error) throw error;
    return data.signedUrl; // return a signed url to the receipt in the bucket
}