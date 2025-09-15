
export async function uploadImageCloudinary(
    file: File,
    folder: string,
    publicId?: string
): Promise<string> {
    const preset_name = import.meta.env.VITE_PRESETNAME;
    const cloud_name = import.meta.env.VITE_CLOUDNAME;

    if (!preset_name || !cloud_name) {
        throw new Error("Faltan variables de Cloudinary (VITE_PRESETNAME o VITE_CLOUDNAME)");
    }

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", preset_name);
    fd.append("folder", folder);

    const uniquePublicId = publicId || `img_${Date.now()}`;
    fd.append("public_id", uniquePublicId);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
        method: "POST",
        body: fd,
    });

    const json = await res.json();
    if (!res.ok) {
        throw new Error(json?.error?.message || "Error al subir a Cloudinary");
    }
    return json.secure_url as string;
}
