import CryptoJS from "crypto-js";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

if (!secretKey) {
    throw new Error("No secret key found");
}

export const encryptMessage = (message: string) => {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
};

export const decryptMessage = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};
