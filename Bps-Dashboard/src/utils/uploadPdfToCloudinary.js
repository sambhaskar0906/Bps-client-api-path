export const uploadPdfToCloudinary = async (pdfBlob, bookingId) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append(
        "file",
        pdfBlob,
        `Quotation_${bookingId}.pdf`
    );
    formData.append("upload_preset", uploadPreset);
    formData.append("resource_type", "raw");

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await res.json();

    if (!data.secure_url) {
        console.error("Cloudinary error:", data);
        throw new Error("Cloudinary upload failed");
    }

    return data.secure_url; // ✅ pdfUrl
};
