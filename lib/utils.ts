import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import html2canvas from "html2canvas-pro";

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

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    width: 1500px;
    height: 1500px;
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
      position: static !important;
      transform: none !important;
      width: 1500px !important;
      height: 1500px !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 16px !important;
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

        const canvas = await html2canvas(virtualDiv, {
            backgroundColor: "#121212",
            width: 1500,
            height: 1500,
            scale: 1,
            logging: false,
            onclone: (clonedDoc) => {
                copyNextFontStyles(clonedDoc);

                const clonedDiv = clonedDoc.getElementById(
                    "privacy-pack-result-to-capture",
                );

                if (clonedDiv) {
                    clonedDiv.style.cssText = `
                        width: 1500px !important;
                        height: 1500px !important;
                        box-sizing: border-box !important;
                        display: block !important;
                        visibility: visible !important;
                        position: static !important;
                        transform: none !important;
                        transform-origin: 0 0 !important;
                        margin: 0 !important;
                        padding: 16px !important;
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
        typeof navigator.canShare === "function" &&
        navigator.canShare(sharePayload)
    ) {
        try {
            await navigator.share(sharePayload);
            return;
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            downloadBlob(blob);
            return;
        }
    }

    downloadBlob(blob);
}

export async function handleDownload() {
    const blob = await capturePrivacyPackImage();

    downloadBlob(blob);
}
