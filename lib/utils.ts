import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const EXPORT_IMAGE_SIZE = 1500;
const EXPORT_IMAGE_SCALE = 2;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 60_000;

export type ShareResult = "shared" | "copied" | "downloaded" | "cancelled";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function downloadBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);

    try {
        const link = document.createElement("a");
        link.href = url;
        link.download = "privacypack.png";
        link.rel = "noopener";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
    }

    window.setTimeout(
        () => URL.revokeObjectURL(url),
        DOWNLOAD_URL_REVOKE_DELAY_MS,
    );
}

function nextAnimationFrame() {
    return new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
    });
}

function copyNextFontStyles(clonedDoc: Document) {
    document.querySelectorAll("style[data-next-font]").forEach((style) => {
        clonedDoc.head.appendChild(style.cloneNode(true));
    });
}

function canvasToBlob(canvas: HTMLCanvasElement) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Could not create PrivacyPack image."));
                }
            },
            "image/png",
            1.0,
        );
    });
}

async function copyBlobToClipboard(blob: Blob) {
    if (
        typeof navigator.clipboard?.write !== "function" ||
        typeof ClipboardItem === "undefined"
    ) {
        return false;
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob,
            }),
        ]);
        return true;
    } catch {
        return false;
    }
}

function waitForImages(container: HTMLElement) {
    const images = Array.from(container.querySelectorAll("img"));
    const imageTimeoutMs = 8000;

    return Promise.all(
        images.map(
            (image) =>
                new Promise<void>((resolve) => {
                    image.loading = "eager";
                    image.decoding = "sync";

                    if (image.complete) {
                        resolve();
                        return;
                    }

                    const timeout = window.setTimeout(
                        () => resolve(),
                        imageTimeoutMs,
                    );
                    const resolveOnce = () => {
                        window.clearTimeout(timeout);
                        resolve();
                    };

                    image.addEventListener("load", () => resolveOnce(), {
                        once: true,
                    });
                    image.addEventListener("error", () => resolveOnce(), {
                        once: true,
                    });

                    const decodePromise = image.decode?.();

                    decodePromise?.then(resolveOnce).catch(resolveOnce);
                }),
        ),
    );
}

function renderPrivacyPackInVirtualDOM() {
    const originalPrivacyPack = document.getElementById(
        "privacy-pack-result-to-capture",
    );

    if (!originalPrivacyPack) {
        throw new Error("PrivacyPack result card was not found.");
    }

    const virtualDiv = document.createElement("div");

    virtualDiv.style.cssText = `
    position: fixed;
    left: -10000px;
    top: 0;
    width: ${EXPORT_IMAGE_SIZE}px;
    height: ${EXPORT_IMAGE_SIZE}px;
    pointer-events: none;
    background-color: #121212;
    font-family: monospace;
    overflow: hidden;
  `;

    const clonedPrivacyPack = originalPrivacyPack.cloneNode(
        true,
    ) as HTMLElement;

    clonedPrivacyPack.querySelectorAll("img").forEach((image) => {
        image.loading = "eager";
        image.decoding = "sync";
    });

    virtualDiv.appendChild(clonedPrivacyPack);
    clonedPrivacyPack.style.cssText = `
      display: block !important;
      position: relative !important;
      transform: none !important;
      width: ${EXPORT_IMAGE_SIZE}px !important;
      height: ${EXPORT_IMAGE_SIZE}px !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
      background-color: #121212 !important;
      font-family: monospace;
    `;

    document.body.appendChild(virtualDiv);

    return virtualDiv;
}

async function capturePrivacyPackImage() {
    const virtualDiv = renderPrivacyPackInVirtualDOM();

    try {
        await nextAnimationFrame();
        await waitForImages(virtualDiv);

        const { default: html2canvas } = await import("html2canvas-pro");
        const canvas = await html2canvas(virtualDiv, {
            backgroundColor: "#121212",
            width: EXPORT_IMAGE_SIZE,
            height: EXPORT_IMAGE_SIZE,
            scale: EXPORT_IMAGE_SCALE,
            logging: false,
            onclone: (clonedDoc) => {
                copyNextFontStyles(clonedDoc);

                const clonedDiv = clonedDoc.getElementById(
                    "privacy-pack-result-to-capture",
                );

                if (clonedDiv) {
                    clonedDiv.style.cssText = `
                        width: ${EXPORT_IMAGE_SIZE}px !important;
                        height: ${EXPORT_IMAGE_SIZE}px !important;
                        box-sizing: border-box !important;
                        display: block !important;
                        visibility: visible !important;
                        position: relative !important;
                        transform: none !important;
                        transform-origin: 0 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background-color: #121212 !important;
                        font-family: monospace;
                        overflow: hidden !important;
                    `;
                }
            },
        });

        return await canvasToBlob(canvas);
    } finally {
        virtualDiv.remove();
    }
}

export async function handleShare() {
    const blob = await capturePrivacyPackImage();
    const file = new File([blob], "privacypack.png", {
        type: "image/png",
    });
    const sharePayload = {
        text: "",
        url: "https://privacypack.org",
        files: [file],
    };

    if (
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare(sharePayload)
    ) {
        try {
            await navigator.share(sharePayload);
            return "shared";
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return "cancelled";
            }
        }
    }

    if (await copyBlobToClipboard(blob)) {
        return "copied";
    }

    downloadBlob(blob);
    return "downloaded";
}

export async function handleDownload() {
    const blob = await capturePrivacyPackImage();

    downloadBlob(blob);
}
