"use client";

import Link from "next/link";
import {
    ArrowRight,
    Download,
    Share2,
    ChevronDown,
    Loader2,
} from "lucide-react";
import React, { useState, useRef } from "react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import data from "../../data/apps.json";
import PrivacyPackResult from "@/components/PrivacyPackResult";
import { handleDownload, handleShare } from "@/lib/utils";
import Image from "next/image";

type AppOption = {
    id: string;
    name: string;
};

const MAX_PRIVATE_ALTERNATIVES = 3;

const categories = [...data.categories].sort((a, b) => a.order - b.order);

const sortByName = (apps: AppOption[]) =>
    [...apps].sort((a, b) => a.name.localeCompare(b.name));

const getPrivateAlternativeLabel = (alternatives: AppOption[]) => {
    if (alternatives.length === 0) {
        return "[Pick]";
    }

    if (alternatives.length === 1) {
        return alternatives[0].name;
    }

    return `${alternatives[0].name} +${alternatives.length - 1}`;
};

export default function App() {
    const [pack, setPack] = useState(() => {
        const initialPack = categories.map((category) => ({
            category: category.name,
            order: category.order,
            mainstream_app_id: category.mainstream_apps[0].id,
            mainstream_app_name: category.mainstream_apps[0].name,
            private_alternatives: [] as AppOption[],
        }));
        return initialPack;
    });

    // track which dropdown is open
    const [openKey, setOpenKey] = useState<string | null>(null);
    const touchKeyRef = useRef<string | null>(null);

    const selectedPack = pack.filter(
        (item) => item.private_alternatives.length > 0,
    );
    const canExport = selectedPack.length > 0;

    const getTouchTriggerHandlers = (key: string) => ({
        onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
            if (e.pointerType === "touch") {
                // prevent Radix from opening immediately on pointerdown
                e.preventDefault();
                touchKeyRef.current = key;
            }
        },
        onClick: () => {
            // only toggle if this was a true tap
            if (touchKeyRef.current === key) {
                setOpenKey((prev) => (prev === key ? null : key));
            }
            touchKeyRef.current = null;
        },
    });

    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [exportMessage, setExportMessage] = useState<{
        type: "info" | "error";
        text: string;
    } | null>(null);
    const isExporting = isDownloading || isSharing;

    const reportExportError = (error: unknown) => {
        console.error(error);
        setExportMessage({
            type: "error",
            text: "Export failed. Please try again.",
        });
    };

    const runDownload = async () => {
        if (!canExport || isExporting) {
            return;
        }

        setExportMessage(null);
        setIsDownloading(true);
        try {
            await handleDownload();
        } catch (error) {
            reportExportError(error);
        } finally {
            setIsDownloading(false);
        }
    };

    const runShare = async () => {
        if (!canExport || isExporting) {
            return;
        }

        setExportMessage(null);
        setIsSharing(true);
        try {
            const result = await handleShare();

            if (result === "copied") {
                setExportMessage({
                    type: "info",
                    text: "Image copied to clipboard.",
                });
            }

            if (result === "downloaded") {
                setExportMessage({
                    type: "info",
                    text: "Sharing is unavailable here, so the PNG was downloaded.",
                });
            }
        } catch (error) {
            reportExportError(error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleSelectMainstreamApp = (
        categoryName: string,
        app: AppOption,
    ) => {
        setPack((prev) =>
            prev.map((item) =>
                item.category === categoryName
                    ? {
                          ...item,
                          mainstream_app_id: app.id,
                          mainstream_app_name: app.name,
                      }
                    : item,
            ),
        );
        setExportMessage(null);
        setOpenKey(null);
    };

    const handleTogglePrivateAlternative = (
        categoryName: string,
        app: AppOption,
    ) => {
        setPack((prev) =>
            prev.map((item) => {
                if (item.category !== categoryName) {
                    return item;
                }

                const isSelected = item.private_alternatives.some(
                    (alternative) => alternative.id === app.id,
                );

                if (isSelected) {
                    return {
                        ...item,
                        private_alternatives: item.private_alternatives.filter(
                            (alternative) => alternative.id !== app.id,
                        ),
                    };
                }

                if (
                    item.private_alternatives.length >= MAX_PRIVATE_ALTERNATIVES
                ) {
                    return item;
                }

                return {
                    ...item,
                    private_alternatives: [...item.private_alternatives, app],
                };
            }),
        );
        setExportMessage(null);
    };

    const handleClearPrivateAlternatives = (categoryName: string) => {
        setPack((prev) =>
            prev.map((item) =>
                item.category === categoryName
                    ? {
                          ...item,
                          private_alternatives: [],
                      }
                    : item,
            ),
        );
        setExportMessage(null);
        setOpenKey(null);
    };

    return (
        <>
            <div className="flex w-full flex-col p-4 pb-36 sm:pb-4">
                <div className="flex w-full flex-row items-center justify-between md:px-4 md:pt-4">
                    <Link
                        href="/"
                        className="green-text pr-1 text-2xl font-bold"
                    >
                        PrivacyPack
                    </Link>
                    <div className="flex flex-row items-center gap-3 sm:gap-4">
                        <a
                            href="https://github.com/ente-io/privacypack?tab=readme-ov-file#add-a-missing-app"
                            target="_blank"
                            rel="noopener"
                            className="text-sm text-[#868686] underline decoration-[#525252] underline-offset-4 hover:text-white hover:decoration-white"
                        >
                            Add a missing app
                        </a>
                        <button
                            onClick={runShare}
                            disabled={!canExport || isExporting}
                            id="share-navbar"
                            title={
                                canExport
                                    ? "Share PrivacyPack"
                                    : "Pick at least one private alternative before exporting"
                            }
                            className="hidden h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#525252] px-5 text-white transition-all duration-150 hover:bg-[#444444] active:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                        >
                            {isSharing ? (
                                <Loader2
                                    color="white"
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Share2 color="white" size={18} />
                            )}
                            <span>{isSharing ? "SHARING..." : "SHARE"}</span>
                        </button>
                        <button
                            onClick={runDownload}
                            disabled={!canExport || isExporting}
                            id="download-navbar"
                            title={
                                canExport
                                    ? "Download PrivacyPack"
                                    : "Pick at least one private alternative before exporting"
                            }
                            className="hidden h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-5 text-black transition-all duration-150 hover:bg-white/80 active:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
                        >
                            {isDownloading ? (
                                <Loader2
                                    color="black"
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Download color="black" size={18} />
                            )}
                            <span>
                                {isDownloading ? "DOWNLOADING..." : "DOWNLOAD"}
                            </span>
                        </button>
                    </div>
                </div>

                {exportMessage && (
                    <div
                        role={
                            exportMessage.type === "error" ? "alert" : "status"
                        }
                        aria-live="polite"
                        className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                            exportMessage.type === "error"
                                ? "bg-red-500/12 text-red-200"
                                : "bg-white/8 text-[#d6d6d6]"
                        }`}
                    >
                        {exportMessage.text}
                    </div>
                )}

                <div className="mt-16 mb-10 grid grid-cols-1 gap-14 sm:mx-auto md:grid-cols-2 md:gap-20 lg:my-24 lg:gap-28 xl:my-24 xl:grid-cols-3 xl:gap-20 2xl:my-32 2xl:gap-40">
                    {pack.map((item) => {
                        const category = categories.find(
                            (c) => c.name === item.category,
                        );
                        const mainstreamApps = category
                            ? sortByName(category.mainstream_apps)
                            : [];
                        const privateAlternatives = category
                            ? sortByName(category.private_alternatives)
                            : [];
                        const selectedPrivateAlternatives =
                            item.private_alternatives;
                        const privateAlternativeLabel =
                            getPrivateAlternativeLabel(
                                selectedPrivateAlternatives,
                            );
                        const privateAlternativeAccessibleLabel =
                            selectedPrivateAlternatives.length > 0
                                ? selectedPrivateAlternatives
                                      .map((alternative) => alternative.name)
                                      .join(", ")
                                : "none selected";

                        const mainKey = `${item.category}-main`;
                        const altKey = `${item.category}-alt`;

                        return (
                            <div
                                key={item.category}
                                className="flex flex-col gap-2"
                            >
                                <div className="mb-1 text-[#aeaeae]">
                                    {item.category}
                                </div>
                                <div className="xs:p-8 flex h-full w-full flex-row items-center justify-between rounded-3xl bg-[#fff]/2 p-3 sm:w-auto sm:justify-normal sm:gap-3 md:rounded-4xl">
                                    <DropdownMenu
                                        open={openKey === mainKey}
                                        onOpenChange={(next) =>
                                            setOpenKey(next ? mainKey : null)
                                        }
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                {...getTouchTriggerHandlers(
                                                    mainKey,
                                                )}
                                                className="flex h-full cursor-pointer touch-pan-y flex-col items-center rounded-2xl bg-[#2B2B2B] p-4 text-[#aeaeae] transition outline-none hover:bg-[#ededed] hover:text-black focus:bg-[#ededed] focus:text-black data-[state=open]:bg-[#ededed] data-[state=open]:text-black md:rounded-3xl"
                                            >
                                                <div className="h-18 w-18 lg:h-24 lg:w-24 xl:h-28 xl:w-28 2xl:h-40 2xl:w-40">
                                                    <Image
                                                        src={`/app-logos/${item.mainstream_app_id}.jpg`}
                                                        alt={
                                                            item.mainstream_app_name
                                                        }
                                                        width={0}
                                                        height={0}
                                                        sizes="100vw"
                                                        priority={
                                                            item.order === 1
                                                        }
                                                        className="h-full w-full rounded-xl object-cover md:rounded-2xl"
                                                    />
                                                </div>
                                                <div className="mt-5 max-w-18 text-center text-xs leading-tight font-medium break-words lg:max-w-24 lg:text-base xl:max-w-28 2xl:max-w-40">
                                                    {item.mainstream_app_name}
                                                </div>
                                                <ChevronDown className="mt-1 h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="start"
                                            side="bottom"
                                            className="rounded-2xl"
                                        >
                                            {mainstreamApps.map(
                                                (mainstream_app) => (
                                                    <DropdownMenuItem
                                                        key={mainstream_app.id}
                                                        onClick={() =>
                                                            handleSelectMainstreamApp(
                                                                item.category,
                                                                mainstream_app,
                                                            )
                                                        }
                                                        className="flex cursor-pointer flex-row items-center gap-2 rounded-lg"
                                                    >
                                                        <div className="h-5 w-5">
                                                            <Image
                                                                src={`/app-logos/${mainstream_app.id}.jpg`}
                                                                alt={
                                                                    mainstream_app.name
                                                                }
                                                                width={0}
                                                                height={0}
                                                                sizes="100vw"
                                                                className="h-auto w-full rounded-sm"
                                                            />
                                                        </div>
                                                        <span className="text-xs break-words sm:text-sm">
                                                            {
                                                                mainstream_app.name
                                                            }
                                                        </span>
                                                    </DropdownMenuItem>
                                                ),
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <ArrowRight className="text-[#aeaeae] transition" />

                                    <DropdownMenu
                                        open={openKey === altKey}
                                        onOpenChange={(next) =>
                                            setOpenKey(next ? altKey : null)
                                        }
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                aria-label={`${item.category} private alternatives: ${privateAlternativeAccessibleLabel}; ${selectedPrivateAlternatives.length} of ${MAX_PRIVATE_ALTERNATIVES} selected`}
                                                {...getTouchTriggerHandlers(
                                                    altKey,
                                                )}
                                                className="flex h-full cursor-pointer touch-pan-y flex-col items-center rounded-2xl bg-[#2B2B2B] p-4 text-[#aeaeae] transition outline-none hover:bg-[#ededed] hover:text-black focus:bg-[#ededed] focus:text-black data-[state=open]:bg-[#ededed] data-[state=open]:text-black md:rounded-3xl"
                                            >
                                                <div
                                                    className={`h-18 w-18 rounded-xl md:rounded-2xl lg:h-24 lg:w-24 xl:h-28 xl:w-28 2xl:h-40 2xl:w-40 ${
                                                        selectedPrivateAlternatives.length ===
                                                        0
                                                            ? "bg-[#383838]"
                                                            : ""
                                                    } ${
                                                        selectedPrivateAlternatives.length >
                                                        1
                                                            ? "grid grid-cols-2 place-items-center gap-1 p-1"
                                                            : ""
                                                    } relative overflow-hidden`}
                                                >
                                                    {selectedPrivateAlternatives.map(
                                                        (
                                                            privateAlternative,
                                                        ) => (
                                                            <div
                                                                key={
                                                                    privateAlternative.id
                                                                }
                                                                className={`overflow-hidden rounded-xl md:rounded-2xl ${
                                                                    selectedPrivateAlternatives.length >
                                                                    1
                                                                        ? "aspect-square w-full bg-white/5"
                                                                        : "h-full w-full"
                                                                }`}
                                                            >
                                                                <Image
                                                                    src={`/app-logos/${privateAlternative.id}.jpg`}
                                                                    alt={
                                                                        privateAlternative.name
                                                                    }
                                                                    width={0}
                                                                    height={0}
                                                                    sizes={
                                                                        selectedPrivateAlternatives.length >
                                                                        1
                                                                            ? "56px"
                                                                            : "160px"
                                                                    }
                                                                    className={`h-full w-full ${
                                                                        selectedPrivateAlternatives.length >
                                                                        1
                                                                            ? "object-contain"
                                                                            : "object-cover"
                                                                    }`}
                                                                />
                                                            </div>
                                                        ),
                                                    )}
                                                    <span className="absolute top-1 right-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-white">
                                                        {
                                                            selectedPrivateAlternatives.length
                                                        }
                                                        /
                                                        {
                                                            MAX_PRIVATE_ALTERNATIVES
                                                        }
                                                    </span>
                                                </div>
                                                <div className="mt-5 max-w-18 text-center text-xs leading-tight font-medium break-words lg:max-w-24 lg:text-base xl:max-w-28 2xl:max-w-40">
                                                    {privateAlternativeLabel}
                                                </div>
                                                <ChevronDown className="mt-1 h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            side="bottom"
                                            className="rounded-2xl"
                                        >
                                            <DropdownMenuLabel className="flex items-center justify-between gap-4 text-xs text-[#aeaeae]">
                                                <span>
                                                    Private alternatives
                                                </span>
                                                <span>
                                                    {
                                                        selectedPrivateAlternatives.length
                                                    }
                                                    /{MAX_PRIVATE_ALTERNATIVES}
                                                </span>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {privateAlternatives.map(
                                                (private_alternative) => {
                                                    const isSelected =
                                                        selectedPrivateAlternatives.some(
                                                            (alternative) =>
                                                                alternative.id ===
                                                                private_alternative.id,
                                                        );
                                                    const isDisabled =
                                                        !isSelected &&
                                                        selectedPrivateAlternatives.length >=
                                                            MAX_PRIVATE_ALTERNATIVES;

                                                    return (
                                                        <DropdownMenuCheckboxItem
                                                            key={
                                                                private_alternative.id
                                                            }
                                                            checked={
                                                                isSelected
                                                            }
                                                            disabled={
                                                                isDisabled
                                                            }
                                                            onSelect={(
                                                                event,
                                                            ) => {
                                                                event.preventDefault();
                                                                handleTogglePrivateAlternative(
                                                                    item.category,
                                                                    private_alternative,
                                                                );
                                                            }}
                                                            className={`cursor-pointer rounded-lg ${
                                                                isSelected
                                                                    ? "bg-white/8 text-white"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div className="flex w-full flex-row items-center gap-2 pl-1">
                                                                <div className="h-5 w-5">
                                                                    <Image
                                                                        src={`/app-logos/${private_alternative.id}.jpg`}
                                                                        alt={
                                                                            private_alternative.name
                                                                        }
                                                                        width={
                                                                            0
                                                                        }
                                                                        height={
                                                                            0
                                                                        }
                                                                        sizes="100vw"
                                                                        className="h-auto w-full rounded-sm"
                                                                    />
                                                                </div>
                                                                <span className="text-xs break-words sm:text-sm">
                                                                    {
                                                                        private_alternative.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </DropdownMenuCheckboxItem>
                                                    );
                                                },
                                            )}
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    handleClearPrivateAlternatives(
                                                        item.category,
                                                    );
                                                }}
                                                className="cursor-pointer rounded-lg"
                                            >
                                                <div className="flex flex-row items-center gap-2">
                                                    {selectedPrivateAlternatives.length >
                                                    0 ? (
                                                        <>
                                                            <div className="h-5 w-5 pl-1 text-red-500">
                                                                —
                                                            </div>
                                                            <span className="text-xs text-red-500 transition duration-500 sm:text-sm">
                                                                Remove
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-5 w-5 pl-1 text-[#aeaeae]">
                                                                —
                                                            </div>
                                                            <span className="text-xs text-[#aeaeae] transition duration-500 sm:text-sm">
                                                                Remove
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t border-white/10 bg-[#161616]/95 p-4 sm:hidden">
                    <button
                        onClick={runShare}
                        disabled={!canExport || isExporting}
                        id="share-mobile"
                        title={
                            canExport
                                ? "Share PrivacyPack"
                                : "Pick at least one private alternative before exporting"
                        }
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white text-black transition-all duration-150 active:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSharing ? (
                            <Loader2
                                color="black"
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <Share2 color="black" size={16} />
                        )}
                        <span className="text-lg">
                            {isSharing ? "EXPORTING..." : "SHARE"}
                        </span>
                    </button>
                    <button
                        onClick={runDownload}
                        disabled={!canExport || isExporting}
                        id="download-mobile"
                        title={
                            canExport
                                ? "Download PrivacyPack"
                                : "Pick at least one private alternative before exporting"
                        }
                        className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#525252] text-white transition-all duration-150 active:bg-[#444444] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <Loader2
                                color="white"
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <Download color="white" size={16} />
                        )}
                        <span className="text-lg">
                            {isDownloading ? "DOWNLOADING..." : "DOWNLOAD"}
                        </span>
                    </button>
                </div>
            </div>

            <PrivacyPackResult pack={selectedPack} />
        </>
    );
}
