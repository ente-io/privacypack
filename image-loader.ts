import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
    return src.startsWith("/") ? src.slice(1) : src;
};

const withImageParams = (url: string, width: number, quality?: number) => {
    const separator = url.includes("?") ? "&" : "?";

    return `${url}${separator}width=${width}&quality=${quality ?? 75}`;
};

export default function cloudflareLoader({
    src,
    width,
    quality,
}: ImageLoaderProps) {
    if (src === "/hero.png") {
        return withImageParams(
            "https://imagedelivery.net/gwqtS4kafZruByi--g_VMg/fea201d8-402f-42d4-c779-9c3f6a069600/public",
            width,
            quality ?? 100,
        );
    }

    if (src === "/logo.png") {
        return withImageParams(
            "https://imagedelivery.net/gwqtS4kafZruByi--g_VMg/1c342f76-f1f0-405e-d68b-ff9f84d17a00/public",
            width,
            quality,
        );
    }

    return withImageParams(`/${normalizeSrc(src)}`, width, quality);
}
